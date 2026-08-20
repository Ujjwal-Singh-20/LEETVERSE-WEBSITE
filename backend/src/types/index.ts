import { Request } from 'express';
import type { firestore } from 'firebase-admin';

export type MemberStatus = 'active' | 'alumni';

export interface MemberDoc {
  name: string;
  username: string;
  status: MemberStatus;
  position: string;
  bio?: string;
  photoUrl?: string | null;
  instagram?: string | null;
  linkedin?: string | null;
  github?: string | null;
  rollNo: string; // Admin-only
  createdAt: firestore.Timestamp | firestore.FieldValue | string | Date;
  updatedAt: firestore.Timestamp | firestore.FieldValue | string | Date;
}

export interface PublicMember {
  name: string;
  username: string;
  status: MemberStatus;
  position: string;
  bio: string;
  photoUrl: string | null;
  instagram: string | null;
  linkedin: string | null;
  github: string | null;
}

export interface AdminMember extends Omit<MemberDoc, 'createdAt' | 'updatedAt'> {
  docId: string;
  domain: string;
  createdAt: string;
  updatedAt: string;
}

export interface UsernameLookupDoc {
  domain: string;
  docId: string;
}

export interface ProjectMemberSnapshot {
  username: string;
  name: string;
  photoUrl: string;
}

export interface ProjectDoc {
  slug: string;
  title: string;
  description: string;
  images: string[];
  members: ProjectMemberSnapshot[];
  createdAt: firestore.Timestamp | firestore.FieldValue | string | Date;
  updatedAt: firestore.Timestamp | firestore.FieldValue | string | Date;
}

export interface ProjectResponse extends Omit<ProjectDoc, 'createdAt' | 'updatedAt'> {
  createdAt: string;
  updatedAt: string;
}

export interface GalleryEventDoc {
  slug: string;
  eventName: string;
  shortDesc: string;
  thumbnail: string;
  images: string[];
  date: firestore.Timestamp | firestore.FieldValue | string | Date;
  createdAt: firestore.Timestamp | firestore.FieldValue | string | Date;
  updatedAt: firestore.Timestamp | firestore.FieldValue | string | Date;
}

export interface GalleryEventResponse extends Omit<GalleryEventDoc, 'date' | 'createdAt' | 'updatedAt'> {
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminDoc {
  email: string;
  name: string;
  active: boolean;
  addedAt: firestore.Timestamp | firestore.FieldValue | string | Date;
}

export interface AuthenticatedAdmin {
  uid: string;
  email: string;
  name: string;
  docId?: string;
}

export interface AuthenticatedRequest extends Request {
  admin?: AuthenticatedAdmin;
}

// Tree view for Domain & Members
export interface DomainTreeNode {
  slug: string;
  name: string;
  members: AdminMember[];
}

// Cached Blob Structures (Vercel Blob)
export interface MembersListingBlob {
  generatedAt: string;
  domains: Array<{
    slug: string;
    name: string;
    members: Array<{
      username: string;
      name: string;
      position: string;
      photoUrl: string | null;
      status: 'active';
    }>;
  }>;
}

export interface ProjectsListingBlob {
  generatedAt: string;
  projects: Array<{
    slug: string;
    title: string;
    description: string;
    thumbnail: string;
    members: ProjectMemberSnapshot[];
  }>;
}

export interface GalleryListingBlob {
  generatedAt: string;
  events: Array<{
    slug: string;
    eventName: string;
    shortDesc: string;
    thumbnail: string;
    date: string;
  }>;
}
