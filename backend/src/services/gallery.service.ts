import { CreateGalleryEventInput, UpdateGalleryEventInput } from '../schemas/gallery.schema';
import { GalleryEventResponse } from '../types';

export class GalleryService {
  /**
   * Public gallery listing (images[] array omitted per docs split)
   */
  async getGalleryListings(): Promise<Array<{ slug: string; eventName: string; shortDesc: string; thumbnail: string; date: string }>> {
    // TODO: Query gallery_events ordered by date desc
    // TODO: Return listing array with thumbnail, eventName, shortDesc, date (OMIT images[])
    throw new Error('[TODO] getGalleryListings not implemented');
  }

  /**
   * Live fetch of images[] array for event popup: GET /api/gallery/:slug/images
   */
  async getGalleryImages(slug: string): Promise<{ slug: string; eventName: string; images: string[] }> {
    // TODO: Read gallery_events/{slug} from Firestore
    // TODO: Throw 404 AppError(GALLERY_NOT_FOUND) if not found
    // TODO: Return { slug, eventName, images: data.images || [] }
    throw new Error(`[TODO] getGalleryImages not implemented for slug: ${slug}`);
  }

  /**
   * Full event detail for admin panel
   */
  async getGalleryEventBySlug(slug: string): Promise<GalleryEventResponse> {
    // TODO: Read gallery_events/{slug} with full images[] and timestamps
    throw new Error(`[TODO] getGalleryEventBySlug not implemented for slug: ${slug}`);
  }

  /**
   * Create new gallery event in gallery_events/{slug}
   */
  async createGalleryEvent(data: CreateGalleryEventInput): Promise<GalleryEventResponse> {
    // TODO: Check slug uniqueness in gallery_events/{slug}
    // TODO: Write event doc with thumbnail, shortDesc, eventName, date, images[]
    // TODO: Return serializeGalleryDetail
    throw new Error(`[TODO] createGalleryEvent not implemented for slug: ${data.slug}`);
  }

  /**
   * Update gallery event
   */
  async updateGalleryEvent(slug: string, data: UpdateGalleryEventInput): Promise<GalleryEventResponse> {
    // TODO: Update fields in gallery_events/{slug} and bump updatedAt
    throw new Error(`[TODO] updateGalleryEvent not implemented for slug: ${slug}`);
  }

  /**
   * Hard delete gallery event
   */
  async deleteGalleryEvent(slug: string): Promise<{ success: boolean; slug: string }> {
    // TODO: Hard delete gallery_events/{slug} from Firestore
    throw new Error(`[TODO] deleteGalleryEvent not implemented for slug: ${slug}`);
  }
}

export const galleryService = new GalleryService();
