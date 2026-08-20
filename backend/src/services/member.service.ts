import { CreateMemberInput } from '../schemas/member.schema';
import { AdminMember, DomainTreeNode, PublicMember } from '../types';

export class MemberService {
  /**
   * Fetches public member profile live via /u/:username
   * Flow per docs:
   * 1. Read usernames/{username} -> gets domain + docId
   * 2. Read members/{domain}/members_listed/{docId} -> returns public fields (rollNo excluded)
   */
  async getPublicMemberByUsername(username: string): Promise<PublicMember> {
    // TODO: Step 1 - Look up usernames/{username.toLowerCase()} in Firestore
    // TODO: Step 2 - Throw 404 AppError(USERNAME_NOT_FOUND) if lookup document does not exist
    // TODO: Step 3 - Read members/{domain}/members_listed/{docId}
    // TODO: Step 4 - Throw 404 AppError(MEMBER_NOT_FOUND) if member document does not exist
    // TODO: Step 5 - Return serializePublicMember(memberData) to guarantee rollNo is never leaked
    throw new Error(`[TODO] getPublicMemberByUsername not implemented for username: ${username}`);
  }

  /**
   * Live uniqueness check for username while typing in admin panel
   */
  async checkUsernameAvailable(username: string): Promise<{ available: boolean; username: string }> {
    // TODO: Step 1 - Query usernames/{username.toLowerCase()}
    // TODO: Step 2 - Return { available: !lookupSnap.exists, username }
    throw new Error(`[TODO] checkUsernameAvailable not implemented for username: ${username}`);
  }

  /**
   * Returns domain hierarchy and nested members for Admin Panel tree/indented view
   * Structure: members/{domain}/members_listed/{docId}
   */
  async getMemberTree(): Promise<DomainTreeNode[]> {
    // TODO: Step 1 - Read all domain documents in members collection
    // TODO: Step 2 - For each domain, read the subcollection members_listed
    // TODO: Step 3 - Serialize and format into DomainTreeNode[]
    throw new Error('[TODO] getMemberTree not implemented');
  }

  /**
   * Creates a new member under a domain with atomic username lookup
   * Flow per docs:
   * - Must run in a Firestore transaction:
   *   1. Check usernames/{username} (fail if taken)
   *   2. Ensure parent domain doc exists in members/{domain}
   *   3. Write members/{domain}/members_listed/{autoId}
   *   4. Write usernames/{username} -> { domain, docId }
   */
  async createMember(domain: string, data: CreateMemberInput): Promise<AdminMember> {
    // TODO: Step 1 - Run db.runTransaction
    // TODO: Step 2 - Check username uniqueness in transaction
    // TODO: Step 3 - Write member doc with serverTimestamp for createdAt and updatedAt
    // TODO: Step 4 - Write usernames/{username} pointer doc
    // TODO: Step 5 - Return serializeAdminMember
    throw new Error(`[TODO] createMember not implemented for domain: ${domain}`);
  }

  /**
   * Single-field autosave on blur (targeted write)
   * Updates only the modified field + bumps updatedAt timestamp
   */
  async updateMemberField(domain: string, docId: string, field: string, value: any): Promise<{ success: boolean; field: string; value: any }> {
    // TODO: Step 1 - Verify members/{domain}/members_listed/{docId} exists
    // TODO: Step 2 - Perform targeted update: update({ [field]: value, updatedAt: serverTimestamp() })
    // TODO: Step 3 - Return confirmation { success: true, field, value }
    throw new Error(`[TODO] updateMemberField not implemented for docId: ${docId}, field: ${field}`);
  }

  /**
   * Hard delete of member + username lookup
   * Must delete both members/{domain}/members_listed/{docId} and usernames/{username} in a transaction
   */
  async deleteMember(domain: string, docId: string): Promise<{ success: boolean; username: string }> {
    // TODO: Step 1 - Run db.runTransaction
    // TODO: Step 2 - Read member doc to get username
    // TODO: Step 3 - Delete member doc and usernames/{username} doc
    // TODO: Step 4 - Return { success: true, username }
    throw new Error(`[TODO] deleteMember not implemented for docId: ${docId}`);
  }
}

export const memberService = new MemberService();
