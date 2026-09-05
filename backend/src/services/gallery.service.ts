import { db } from '../config/firebase';
import { COLLECTIONS } from '../constants/collections';
import { ERROR_CODES } from '../constants/errorCodes';
import { AppError } from '../middlewares/error.middleware';
import { CreateGalleryEventInput, UpdateGalleryEventInput } from '../schemas/gallery.schema';
import { serializeGalleryListingItem, serializeGalleryDetail } from '../serializers/gallery.serializer';
import { GalleryEventDoc, GalleryEventResponse } from '../types';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

export class GalleryService {
  async getGalleryListings(): Promise<Array<{ slug: string; eventName: string; shortDesc: string; thumbnail: string; date: string }>> {
    const snap = await db
      .collection(COLLECTIONS.GALLERY_EVENTS)
      .orderBy('date', 'desc')
      .get();

    return snap.docs.map((doc) => serializeGalleryListingItem(doc.data() as GalleryEventDoc));
  }

  async getGalleryImages(slug: string): Promise<{ slug: string; eventName: string; images: string[] }> {
    const doc = await db.collection(COLLECTIONS.GALLERY_EVENTS).doc(slug).get();

    if (!doc.exists) {
      throw new AppError(404, ERROR_CODES.GALLERY_NOT_FOUND, `Gallery event '${slug}' not found.`);
    }

    const data = doc.data() as GalleryEventDoc;
    return { slug: data.slug, eventName: data.eventName, images: data.images || [] };
  }

  async getGalleryEventBySlug(slug: string): Promise<GalleryEventResponse> {
    const doc = await db.collection(COLLECTIONS.GALLERY_EVENTS).doc(slug).get();

    if (!doc.exists) {
      throw new AppError(404, ERROR_CODES.GALLERY_NOT_FOUND, `Gallery event '${slug}' not found.`);
    }

    return serializeGalleryDetail(doc.data() as GalleryEventDoc);
  }

  async createGalleryEvent(data: CreateGalleryEventInput): Promise<GalleryEventResponse> {
    const existing = await db.collection(COLLECTIONS.GALLERY_EVENTS).doc(data.slug).get();
    if (existing.exists) {
      throw new AppError(400, ERROR_CODES.VALIDATION_ERROR, `Gallery event slug '${data.slug}' is already taken.`);
    }

    const now = FieldValue.serverTimestamp();
    const eventDate = Timestamp.fromDate(new Date(data.date));
    const eventData: Record<string, any> = {
      slug: data.slug,
      eventName: data.eventName,
      shortDesc: data.shortDesc,
      thumbnail: data.thumbnail,
      images: data.images || [],
      date: eventDate,
      createdAt: now,
      updatedAt: now,
    };

    await db.collection(COLLECTIONS.GALLERY_EVENTS).doc(data.slug).set(eventData);

    return serializeGalleryDetail({
      ...eventData,
      date: data.date,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as unknown as GalleryEventDoc);
  }

  async updateGalleryEvent(slug: string, data: UpdateGalleryEventInput): Promise<GalleryEventResponse> {
    const docRef = db.collection(COLLECTIONS.GALLERY_EVENTS).doc(slug);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      throw new AppError(404, ERROR_CODES.GALLERY_NOT_FOUND, `Gallery event '${slug}' not found.`);
    }

    const updates: Record<string, any> = { ...data, updatedAt: FieldValue.serverTimestamp() };
    if (data.date) {
      updates.date = Timestamp.fromDate(new Date(data.date));
    }

    await docRef.update(updates);

    const updatedSnap = await docRef.get();
    return serializeGalleryDetail(updatedSnap.data() as GalleryEventDoc);
  }

  async deleteGalleryEvent(slug: string): Promise<{ success: boolean; slug: string }> {
    const docRef = db.collection(COLLECTIONS.GALLERY_EVENTS).doc(slug);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      throw new AppError(404, ERROR_CODES.GALLERY_NOT_FOUND, `Gallery event '${slug}' not found.`);
    }

    await docRef.delete();
    return { success: true, slug };
  }
}

export const galleryService = new GalleryService();
