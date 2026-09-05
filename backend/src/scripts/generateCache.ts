import { db } from '../config/firebase';
import { COLLECTIONS } from '../constants/collections';
import { ENV } from '../config/env';
import {
  GalleryListingBlob,
  MembersListingBlob,
  ProjectsListingBlob,
  RemindersListingBlob,
  GalleryEventDoc,
  ProjectDoc,
  MemberDoc,
  ReminderDoc,
} from '../types';
import * as fs from 'fs';
import * as path from 'path';
import { Timestamp } from 'firebase-admin/firestore';
import { blobCacheService } from '../services/blobCache.service';

function formatTimestamp(timestamp: any): string {
  if (!timestamp) return new Date().toISOString();
  if (typeof timestamp.toDate === 'function') return timestamp.toDate().toISOString();
  if (typeof timestamp === 'string') return timestamp;
  if (timestamp instanceof Date) return timestamp.toISOString();
  return new Date().toISOString();
}

export async function generateMembersListing(): Promise<MembersListingBlob> {
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

  return {
    generatedAt: new Date().toISOString(),
    domains: domains.filter((d) => d.members.length > 0),
  };
}

export async function generateProjectsListing(): Promise<ProjectsListingBlob> {
  const snap = await db
    .collection(COLLECTIONS.PROJECTS)
    .orderBy('createdAt', 'desc')
    .get();

  const projects = snap.docs.map((doc) => {
    const data = doc.data() as ProjectDoc;
    return {
      slug: data.slug,
      title: data.title,
      description: data.description,
      thumbnail: (data.images && data.images[0]) || '',
      images: data.images || [],
      members: data.members || [],
    };
  });

  return { generatedAt: new Date().toISOString(), projects };
}

export async function generateGalleryListing(): Promise<GalleryListingBlob> {
  const snap = await db
    .collection(COLLECTIONS.GALLERY_EVENTS)
    .orderBy('date', 'desc')
    .get();

  const events = snap.docs.map((doc) => {
    const data = doc.data() as GalleryEventDoc;
    return {
      slug: data.slug,
      eventName: data.eventName,
      shortDesc: data.shortDesc,
      thumbnail: data.thumbnail,
      date: formatTimestamp(data.date),
    };
  });

  return { generatedAt: new Date().toISOString(), events };
}

export async function generateRemindersListing(): Promise<RemindersListingBlob> {
  const now = Timestamp.now();
  const snap = await db
    .collection(COLLECTIONS.REMINDERS)
    .where('endAt', '>=', now)
    .orderBy('endAt', 'asc')
    .get();

  const reminders = snap.docs.map((doc) => {
    const data = doc.data() as ReminderDoc;
    return {
      docId: doc.id,
      text: data.text,
      startAt: formatTimestamp(data.startAt),
      endAt: formatTimestamp(data.endAt),
      targetSection: data.targetSection || 'global',
    };
  });

  return { generatedAt: new Date().toISOString(), reminders };
}

async function uploadToBlob(
  filename: string,
  data: Record<string, unknown>
): Promise<string> {
  const { put } = await import('@vercel/blob');
  const json = JSON.stringify(data, null, 2);
  const result = await put(filename, json, {
    access: 'public',
    token: ENV.BLOB_READ_WRITE_TOKEN,
    addRandomSuffix: false,
    contentType: 'application/json',
  });
  console.log(`  ✅ Uploaded ${filename} to Vercel Blob (${result.url})`);
  blobCacheService.setUrl(filename, result.url);
  return result.url;
}

export async function generateAllCaches(): Promise<{
  timestamp: string;
  files: string[];
  destination: 'blob';
}> {
  console.log('🚀 Starting LeetVerse Vercel Blob Cache Refresh Job...');
  
  if (!ENV.BLOB_READ_WRITE_TOKEN || ENV.BLOB_READ_WRITE_TOKEN.includes('vercel_blob_rw_xxx')) {
    throw new Error(
      'BLOB_READ_WRITE_TOKEN is not configured. Cache generation requires a valid Vercel Blob read/write token.'
    );
  }

  const files: string[] = [];

  console.log('\n📋 Generating members listing blob...');
  const membersBlob = await generateMembersListing();
  await uploadToBlob('members-listing.json', membersBlob as any);
  files.push('members-listing.json');

  console.log('📋 Generating projects listing blob...');
  const projectsBlob = await generateProjectsListing();
  await uploadToBlob('projects-listing.json', projectsBlob as any);
  files.push('projects-listing.json');

  console.log('📋 Generating gallery listing blob...');
  const galleryBlob = await generateGalleryListing();
  await uploadToBlob('gallery-listing.json', galleryBlob as any);
  files.push('gallery-listing.json');

  console.log('📋 Generating reminders listing blob...');
  const remindersBlob = await generateRemindersListing();
  await uploadToBlob('reminders-listing.json', remindersBlob as any);
  files.push('reminders-listing.json');

  console.log('\n✨ Vercel Blob cache refresh complete!');
  return {
    timestamp: new Date().toISOString(),
    files,
    destination: 'blob',
  };
}

// Auto-run if executed directly via CLI
if (require.main === module) {
  generateAllCaches().catch((error) => {
    console.error('❌ Cache refresh failed:', error);
    process.exit(1);
  });
}
