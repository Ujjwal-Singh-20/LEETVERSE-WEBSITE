import { Response, NextFunction, Request } from 'express';
import { reminderService } from '../services/reminder.service';
import { blobCacheService } from '../services/blobCache.service';
import { AuthenticatedRequest, RemindersListingBlob } from '../types';

export class AdminReminderController {
  /**
   * GET /api/admin/reminders
   * Returns all reminders ordered by startAt desc
   */
  async getReminders(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const reminders = await reminderService.getAllReminders();
      res.status(200).json({ reminders });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/admin/reminders
   * Creates a new reminder
   */
  async createReminder(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const reminder = await reminderService.createReminder(req.body);
      res.status(201).json({
        message: 'Reminder created successfully.',
        reminder,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/admin/reminders/:docId
   * Deletes a reminder
   */
  async deleteReminder(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
    try {
      const docId = String(req.params.docId);
      const result = await reminderService.deleteReminder(docId);
      res.status(200).json({
        message: 'Reminder deleted successfully.',
        docId: result.docId,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/reminders
   * Prioritizes Vercel Blob static cache, falls back to direct Firestore DB
   */
  async getPublicReminders(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // 1. Priority: Attempt to read static cache from Vercel Blob
      const cached = await blobCacheService.getBlobData<RemindersListingBlob>('reminders-listing.json');
      if (cached) {
        res.status(200).json(cached);
        return;
      }

      // 2. Fallback: Direct Firestore DB read
      const reminders = await reminderService.getPublicReminders();
      res.status(200).json({
        generatedAt: new Date().toISOString(),
        reminders,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const adminReminderController = new AdminReminderController();
