import { AdminMember, MemberDoc, PublicMember } from '../types';

const formatTimestamp = (timestamp: any): string => {
  if (!timestamp) return new Date().toISOString();
  if (typeof timestamp.toDate === 'function') {
    return timestamp.toDate().toISOString();
  }
  if (typeof timestamp === 'string') {
    return timestamp;
  }
  if (timestamp instanceof Date) {
    return timestamp.toISOString();
  }
  return new Date().toISOString();
};

/**
 * Strips rollNo and private metadata from member profile for public consumption (/u/:username)
 * Enforces explicit allowlist per specs
 */
export const serializePublicMember = (data: MemberDoc, domain?: string): PublicMember => {
  const primaryDomain = data.domain || domain || (data.domains?.[0] ?? 'general');
  return {
    name: data.name,
    username: data.username,
    status: data.status,
    position: data.position,
    domain: primaryDomain,
    domains: data.domains || (domain ? [domain] : []),
    domainRoles: data.domainRoles || (primaryDomain ? { [primaryDomain]: data.position } : {}),
    bio: data.bio || '',
    photoUrl: data.photoUrl || null,
    instagram: data.instagram || null,
    linkedin: data.linkedin || null,
    github: data.github || null,
  };
};

/**
 * Formats member for admin panel with rollNo, docId, and ISO timestamp strings
 */
export const serializeAdminMember = (
  docId: string,
  domain: string,
  data: MemberDoc
): AdminMember => {
  const primaryDomain = data.domain || domain || (data.domains?.[0] ?? 'general');
  return {
    docId,
    domain: primaryDomain,
    domains: data.domains || (domain ? [domain] : []),
    domainRoles: data.domainRoles || (primaryDomain ? { [primaryDomain]: data.position } : {}),
    name: data.name,
    username: data.username,
    status: data.status,
    position: data.position,
    bio: data.bio || '',
    photoUrl: data.photoUrl || null,
    instagram: data.instagram || null,
    linkedin: data.linkedin || null,
    github: data.github || null,
    rollNo: data.rollNo,
    createdAt: formatTimestamp(data.createdAt),
    updatedAt: formatTimestamp(data.updatedAt),
  };
};
