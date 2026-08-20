import { Response, NextFunction } from 'express';
import { galleryService } from '../services/gallery.service';
import { AuthenticatedRequest } from '../types';

export class AdminGalleryController {
  /**
   * GET /api/admin/gallery — Get all events for admin panel
   */
  async getGalleryEvents(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const events = await galleryService.getGalleryListings();
      res.status(200).json(events);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/gallery/:slug — Get full event detail with images[]
   */
  async getGalleryEvent(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const slug = String(req.params.slug);
      const event = await galleryService.getGalleryEventBySlug(slug);
      res.status(200).json(event);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/admin/gallery — Create gallery event
   */
  async createGalleryEvent(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const event = await galleryService.createGalleryEvent(req.body);
      res.status(201).json(event);
    } catch (error) {
      next(error);
    }
  }

  /**
   * PATCH /api/admin/gallery/:slug — Update gallery event
   */
  async updateGalleryEvent(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const slug = String(req.params.slug);
      const event = await galleryService.updateGalleryEvent(slug, req.body);
      res.status(200).json(event);
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/admin/gallery/:slug — Delete gallery event
   */
  async deleteGalleryEvent(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const slug = String(req.params.slug);
      const result = await galleryService.deleteGalleryEvent(slug);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }
}

export const adminGalleryController = new AdminGalleryController();
