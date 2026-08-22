import { db } from '../config/firebase';
import { COLLECTIONS } from '../constants/collections';
import { ENV } from '../config/env';
import {
  GalleryListingBlob,
  MembersListingBlob,
  ProjectsListingBlob,
  GalleryEventDoc,
  ProjectDoc,
  MemberDoc,
} from '../types';
import * as fs from 'fs';
import * as path from 'path';

function formatTimestamp(timestamp: any): string {
  if (!timestamp) return new Date().toISOString();
  if (typeof timestamp.toDate === 'function') return timestamp.toDate().toISOString();
  if (typeof timestamp === 'string') return timestamp;
  if (timestamp instanceof Date) return timestamp.toISOString();
  return new Date().toISOString();
}

async function generateMembersListing(): Promise<MembersListingBlob> {
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

async function generateProjectsListing(): Promise<ProjectsListingBlob> {
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
      thumbnail: data.images[0] || '',
      members: data.members || [],
    };
  });

  return { generatedAt: new Date().toISOString(), projects };
}

async function generateGalleryListing(): Promise<GalleryListingBlob> {
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

async function uploadToBlob(
  filename: string,
  data: Record<string, unknown>
): Promise<void> {
  const { put } = await import('@vercel/blob');
  const json = JSON.stringify(data, null, 2);
  await put(filename, json, {
    access: 'public',
    token: ENV.BLOB_READ_WRITE_TOKEN,
  });
  console.log(`  ✅ Uploaded ${filename} to Vercel Blob`);
}

function saveToLocal(filename: string, data: Record<string, unknown>): void {
  const cacheDir = path.join(process.cwd(), 'dist', 'cache');
  if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir, { recursive: true });
  }
  const filePath = path.join(cacheDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`  💾 Saved ${filePath} locally (no BLOB_READ_WRITE_TOKEN)`);
}

async function run(): Promise<void> {
  console.log('🚀 Starting LeetVerse Cache Refresh Job...');
  const useBlob = !!ENV.BLOB_READ_WRITE_TOKEN;

  try {
    console.log('\n📋 Generating members listing...');
    const membersBlob = await generateMembersListing();
    if (useBlob) {
      await uploadToBlob('members-listing.json', membersBlob as any);
    } else {
      saveToLocal('members-listing.json', membersBlob as any);
    }

    console.log('📋 Generating projects listing...');
    const projectsBlob = await generateProjectsListing();
    if (useBlob) {
      await uploadToBlob('projects-listing.json', projectsBlob as any);
    } else {
      saveToLocal('projects-listing.json', projectsBlob as any);
    }

    console.log('📋 Generating gallery listing...');
    const galleryBlob = await generateGalleryListing();
    if (useBlob) {
      await uploadToBlob('gallery-listing.json', galleryBlob as any);
    } else {
      saveToLocal('gallery-listing.json', galleryBlob as any);
    }

    console.log('\n✨ Cache refresh complete!');
  } catch (error) {
    console.error('❌ Cache refresh failed:', error);
    process.exit(1);
  }
}

run();
