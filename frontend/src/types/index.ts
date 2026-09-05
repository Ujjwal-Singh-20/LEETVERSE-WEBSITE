export type MemberStatus = 'active' | 'alumni';

export interface PublicMember {
  name: string;
  username: string;
  status: MemberStatus;
  position: string;
  bio?: string;
  photoUrl?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
  github?: string | null;
}

export interface DomainGroup {
  slug: string;
  name: string;
  members: PublicMember[];
}

export interface ProjectMemberSnapshot {
  username: string;
  name: string;
  photoUrl: string;
}

export interface Project {
  slug: string;
  title: string;
  description: string;
  images: string[];
  thumbnail?: string;
  members: ProjectMemberSnapshot[];
  createdAt: string;
  updatedAt: string;
}

export interface GalleryListingItem {
  slug: string;
  eventName: string;
  shortDesc: string;
  thumbnail: string;
  date: string;
}

export interface GalleryDetail extends GalleryListingItem {
  images: string[];
  createdAt?: string;
  updatedAt?: string;
}

export type ReminderTargetSection = 'hero' | 'members' | 'projects' | 'gallery' | 'global';

export interface Reminder {
  docId: string;
  text: string;
  startAt: string;
  endAt: string;
  targetSection: ReminderTargetSection;
}

export interface AdminMember extends PublicMember {
  docId: string;
  domain: string;
  rollNo: string;
  createdAt: string;
  updatedAt: string;
}

export interface DomainTreeNode {
  slug: string;
  name: string;
  members: AdminMember[];
}

export interface AdminUser {
  uid: string;
  email: string;
  name: string;
  role?: string;
  docId?: string;
}

export interface ApiError {
  code: string;
  message: string;
}
