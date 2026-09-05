import { db } from '../config/firebase';
import { COLLECTIONS } from '../constants/collections';
import { ERROR_CODES } from '../constants/errorCodes';
import { AppError } from '../middlewares/error.middleware';
import { CreateReminderInput } from '../schemas/reminder.schema';
import { serializeReminder, serializeReminderListingItem } from '../serializers/reminder.serializer';
import { ReminderDoc, ReminderResponse } from '../types';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';

export class ReminderService {
  /**
   * Retrieves all reminders sorted by startAt desc (admin view: past, active, upcoming)
   */
  async getAllReminders(): Promise<ReminderResponse[]> {
    const snap = await db
      .collection(COLLECTIONS.REMINDERS)
      .orderBy('startAt', 'desc')
      .get();

    return snap.docs.map((doc) => serializeReminder(doc.id, doc.data() as ReminderDoc));
  }

  /**
   * Retrieves active & upcoming reminders (endAt >= now) for the public fallback endpoint / cache
   */
  async getPublicReminders(): Promise<Array<{ docId: string; text: string; startAt: string; endAt: string; targetSection: string }>> {
    const now = Timestamp.now();
    const snap = await db
      .collection(COLLECTIONS.REMINDERS)
      .where('endAt', '>=', now)
      .orderBy('endAt', 'asc')
      .get();

    return snap.docs.map((doc) => serializeReminderListingItem(doc.id, doc.data() as ReminderDoc));
  }

  /**
   * Creates a new reminder document
   */
  async createReminder(data: CreateReminderInput): Promise<ReminderResponse> {
    const now = FieldValue.serverTimestamp();
    const startTimestamp = Timestamp.fromDate(new Date(data.startAt));
    const endTimestamp = Timestamp.fromDate(new Date(data.endAt));

    const reminderData: Record<string, any> = {
      text: data.text,
      startAt: startTimestamp,
      endAt: endTimestamp,
      targetSection: data.targetSection || 'global',
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await db.collection(COLLECTIONS.REMINDERS).add(reminderData);

    return serializeReminder(docRef.id, {
      ...reminderData,
      startAt: data.startAt,
      endAt: data.endAt,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as unknown as ReminderDoc);
  }

  /**
   * Deletes a reminder document by ID
   */
  async deleteReminder(docId: string): Promise<{ success: boolean; docId: string }> {
    const docRef = db.collection(COLLECTIONS.REMINDERS).doc(docId);
    const docSnap = await docRef.get();

    if (!docSnap.exists) {
      throw new AppError(404, ERROR_CODES.REMINDER_NOT_FOUND, `Reminder with ID '${docId}' not found.`);
    }

    await docRef.delete();
    return { success: true, docId };
  }
}

export const reminderService = new ReminderService();
