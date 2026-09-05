import { ReminderDoc, ReminderResponse } from '../types';

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

export const serializeReminder = (docId: string, data: ReminderDoc): ReminderResponse => {
  return {
    docId,
    text: data.text,
    startAt: formatTimestamp(data.startAt),
    endAt: formatTimestamp(data.endAt),
    targetSection: data.targetSection || 'global',
    createdAt: formatTimestamp(data.createdAt),
    updatedAt: formatTimestamp(data.updatedAt),
  };
};

export const serializeReminderListingItem = (docId: string, data: ReminderDoc) => {
  return {
    docId,
    text: data.text,
    startAt: formatTimestamp(data.startAt),
    endAt: formatTimestamp(data.endAt),
    targetSection: data.targetSection || 'global',
  };
};
