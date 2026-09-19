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

    return serializePublicMember(memberSnap.data() as MemberDoc, lookup.domain);
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
    const rawDomains = Array.isArray(data.domains) && data.domains.length > 0
      ? data.domains
      : (domain ? [domain] : ['general']);

    const cleanDomains = Array.from(
      new Set(rawDomains.map((d) => String(d).trim().toLowerCase()).filter(Boolean))
    );

    const primaryDomain = (domain ? domain.trim().toLowerCase() : cleanDomains[0]) || 'general';
    if (!cleanDomains.includes(primaryDomain)) {
      cleanDomains.unshift(primaryDomain);
    }

    const result = await db.runTransaction(async (transaction) => {
      const usernameRef = db.collection(COLLECTIONS.USERNAMES).doc(normalizedUsername);
      const usernameSnap = await transaction.get(usernameRef);

      if (usernameSnap.exists) {
        throw new AppError(400, ERROR_CODES.USERNAME_TAKEN, `Username '${normalizedUsername}' is already taken.`);
      }

      const domainRef = db.collection(COLLECTIONS.MEMBERS).doc(primaryDomain);
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
        domain: primaryDomain,
        domains: cleanDomains,
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
        domain: primaryDomain,
        docId: memberRef.id,
      });

      return { docId: memberRef.id, domain: primaryDomain, memberData, normalizedUsername };
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

      const member = memberSnap.data() as MemberDoc;
      const usernameRef = db.collection(COLLECTIONS.USERNAMES).doc(member.username.toLowerCase());

      transaction.delete(memberRef);
      transaction.delete(usernameRef);

      return { username: member.username };
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
      domains?: string[];
      status: 'active';
    }>;
  }>> {
    const formatDomainTitle = (slug: string): string => {
      const s = slug.toLowerCase().trim();
      if (s === 'ai-ml' || s === 'aiml' || s === 'ai/ml') return 'AI/ML';
      if (s === 'cp-dsa' || s === 'cp' || s === 'dsa' || s === 'competitive-programming' || s === 'competetive-programming') {
        return 'COMPETITIVE PROGRAMMING';
      }
      if (s === 'graphic-design' || s === 'design' || s === 'graphics') return 'GRAPHIC DESIGN';
      if (s === 'marketing-pr' || s === 'marketing' || s === 'pr') return 'MARKETING AND PR';
      if (s === 'cloud' || s === 'cloud-devops') return 'CLOUD';
      if (s === 'video-editing' || s === 'vide-editing' || s === 'video') return 'VIDEO EDITING';
      if (s === 'web-dev' || s === 'web' || s === 'web-development') return 'WEB DEV';
      if (s === 'app-dev' || s === 'app' || s === 'mobile-dev' || s === 'app-development') return 'APP DEV';
      if (s === 'data-science' || s === 'data-analytics' || s === 'data-science-and-analytics' || s === 'data-science-and-data-analytics') {
        return 'DATA SCIENCE AND ANALYTICS';
      }
      return slug.replace(/-/g, ' ').toUpperCase();
    };

    const domainsSnap = await db.collection(COLLECTIONS.MEMBERS).listDocuments();
    const domainNameMap = new Map<string, string>();
    const domainMembersMap = new Map<string, Array<any>>();
    const orderedDomainSlugs: string[] = [];

    for (const domainDoc of domainsSnap) {
      const dSlug = domainDoc.id;
      if (!orderedDomainSlugs.includes(dSlug)) orderedDomainSlugs.push(dSlug);
      domainNameMap.set(dSlug, formatDomainTitle(dSlug));
      if (!domainMembersMap.has(dSlug)) {
        domainMembersMap.set(dSlug, []);
      }

      const membersSnap = await domainDoc
        .collection(COLLECTIONS.MEMBERS_LISTED)
        .where('status', '==', 'active')
        .get();

      for (const doc of membersSnap.docs) {
        const data = doc.data() as MemberDoc;
        const memberDomains = (data.domains && data.domains.length > 0)
          ? data.domains
          : [dSlug];

        const memberItem = serializePublicMember(data, dSlug);

        // Map this member into all their designated domains
        for (const targetSlug of memberDomains) {
          if (!orderedDomainSlugs.includes(targetSlug)) orderedDomainSlugs.push(targetSlug);
          if (!domainNameMap.has(targetSlug)) {
            domainNameMap.set(targetSlug, formatDomainTitle(targetSlug));
          }
          if (!domainMembersMap.has(targetSlug)) {
            domainMembersMap.set(targetSlug, []);
          }
          const list = domainMembersMap.get(targetSlug)!;
          if (!list.some((m) => m.username === memberItem.username)) {
            list.push(memberItem);
          }
        }
      }
    }

    return orderedDomainSlugs
      .map((slug) => ({
        slug,
        name: domainNameMap.get(slug) || formatDomainTitle(slug),
        members: domainMembersMap.get(slug) || [],
      }))
      .filter((d) => d.members.length > 0);
  }
}

export const memberService = new MemberService();
