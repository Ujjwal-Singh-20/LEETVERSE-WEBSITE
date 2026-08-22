import { db } from '../config/firebase';
import { COLLECTIONS } from '../constants/collections';
import { ERROR_CODES } from '../constants/errorCodes';
import { AppError } from '../middlewares/error.middleware';
import { CreateMemberInput } from '../schemas/member.schema';
import { serializePublicMember, serializeAdminMember } from '../serializers/member.serializer';
import { AdminMember, DomainTreeNode, MemberDoc, PublicMember, UsernameLookupDoc } from '../types';
import { FieldValue } from 'firebase-admin/firestore';

export class MemberService {
  async getPublicMemberByUsername(username: string): Promise<PublicMember> {
    const lookupSnap = await db
      .collection(COLLECTIONS.USERNAMES)
      .doc(username.toLowerCase())
      .get();

    if (!lookupSnap.exists) {
      throw new AppError(404, ERROR_CODES.USERNAME_NOT_FOUND, `No member found with username '${username}'.`);
    }

    const lookup = lookupSnap.data() as UsernameLookupDoc;

    const memberSnap = await db
      .collection(COLLECTIONS.MEMBERS)
      .doc(lookup.domain)
      .collection(COLLECTIONS.MEMBERS_LISTED)
      .doc(lookup.docId)
      .get();

    if (!memberSnap.exists) {
      throw new AppError(404, ERROR_CODES.MEMBER_NOT_FOUND, 'Member profile not found.');
    }

    return serializePublicMember(memberSnap.data() as MemberDoc);
  }

  async checkUsernameAvailable(username: string): Promise<{ available: boolean; username: string }> {
    const lookupSnap = await db
      .collection(COLLECTIONS.USERNAMES)
      .doc(username.toLowerCase())
      .get();

    return { available: !lookupSnap.exists, username };
  }

  async getMemberTree(): Promise<DomainTreeNode[]> {
    const domainsSnap = await db.collection(COLLECTIONS.MEMBERS).listDocuments();

    const tree: DomainTreeNode[] = await Promise.all(
      domainsSnap.map(async (domainDoc) => {
        const membersSnap = await domainDoc
          .collection(COLLECTIONS.MEMBERS_LISTED)
          .get();

        const members = membersSnap.docs.map((doc) =>
          serializeAdminMember(doc.id, domainDoc.id, doc.data() as MemberDoc)
        );

        return {
          slug: domainDoc.id,
          name: domainDoc.id
            .split('-')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' '),
          members,
        };
      })
    );

    return tree;
  }

  async createMember(domain: string, data: CreateMemberInput): Promise<AdminMember> {
    const normalizedUsername = data.username.toLowerCase();

    const result = await db.runTransaction(async (transaction) => {
      const usernameRef = db.collection(COLLECTIONS.USERNAMES).doc(normalizedUsername);
      const usernameSnap = await transaction.get(usernameRef);

      if (usernameSnap.exists) {
        throw new AppError(400, ERROR_CODES.USERNAME_TAKEN, `Username '${normalizedUsername}' is already taken.`);
      }

      const domainRef = db.collection(COLLECTIONS.MEMBERS).doc(domain);
      const domainSnap = await transaction.get(domainRef);
      if (!domainSnap.exists) {
        transaction.set(domainRef, { createdAt: FieldValue.serverTimestamp() });
      }

      const memberRef = domainRef.collection(COLLECTIONS.MEMBERS_LISTED).doc();
      const now = FieldValue.serverTimestamp();
      const memberData: Record<string, any> = {
        name: data.name,
        username: normalizedUsername,
        status: data.status,
        position: data.position,
        bio: data.bio || '',
        rollNo: data.rollNo,
        createdAt: now,
        updatedAt: now,
      };

      if (data.photoUrl) memberData.photoUrl = data.photoUrl;
      if (data.instagram) memberData.instagram = data.instagram;
      if (data.linkedin) memberData.linkedin = data.linkedin;
      if (data.github) memberData.github = data.github;

      transaction.set(memberRef, memberData);

      transaction.set(usernameRef, {
        domain,
        docId: memberRef.id,
      });

      return { docId: memberRef.id, domain, memberData, normalizedUsername };
    });

    return serializeAdminMember(result.docId, result.domain, {
      ...result.memberData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as MemberDoc);
  }

  async updateMemberField(
    domain: string,
    docId: string,
    field: string,
    value: any
  ): Promise<{ success: boolean; field: string; value: any }> {
    const memberRef = db
      .collection(COLLECTIONS.MEMBERS)
      .doc(domain)
      .collection(COLLECTIONS.MEMBERS_LISTED)
      .doc(docId);

    const memberSnap = await memberRef.get();
    if (!memberSnap.exists) {
      throw new AppError(404, ERROR_CODES.MEMBER_NOT_FOUND, 'Member not found.');
    }

    await memberRef.update({
      [field]: value,
      updatedAt: FieldValue.serverTimestamp(),
    });

    return { success: true, field, value };
  }

  async deleteMember(domain: string, docId: string): Promise<{ success: boolean; username: string }> {
    const result = await db.runTransaction(async (transaction) => {
      const memberRef = db
        .collection(COLLECTIONS.MEMBERS)
        .doc(domain)
        .collection(COLLECTIONS.MEMBERS_LISTED)
        .doc(docId);

      const memberSnap = await transaction.get(memberRef);
      if (!memberSnap.exists) {
        throw new AppError(404, ERROR_CODES.MEMBER_NOT_FOUND, 'Member not found.');
      }

      const memberData = memberSnap.data() as MemberDoc;
      const usernameRef = db.collection(COLLECTIONS.USERNAMES).doc(memberData.username);

      transaction.delete(memberRef);
      transaction.delete(usernameRef);

      return { username: memberData.username };
    });

    return { success: true, username: result.username };
  }

  async getActiveMembersByDomain(): Promise<Array<{
    slug: string;
    name: string;
    members: Array<{
      username: string;
      name: string;
      position: string;
      photoUrl: string | null;
      status: 'active';
    }>;
  }>> {
    const domainsSnap = await db.collection(COLLECTIONS.MEMBERS).listDocuments();

    const domains = await Promise.all(
      domainsSnap.map(async (domainDoc) => {
        const membersSnap = await domainDoc
          .collection(COLLECTIONS.MEMBERS_LISTED)
          .where('status', '==', 'active')
          .get();

        const members = membersSnap.docs.map((doc) => {
          const data = doc.data() as MemberDoc;
          return {
            username: data.username,
            name: data.name,
            position: data.position,
            photoUrl: data.photoUrl || null,
            status: 'active' as const,
          };
        });

        return {
          slug: domainDoc.id,
          name: domainDoc.id
            .split('-')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' '),
          members,
        };
      })
    );

    return domains.filter((d) => d.members.length > 0);
  }
}

export const memberService = new MemberService();
