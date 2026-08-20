import { GalleryEventDoc, GalleryEventResponse } from '../types';

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

export const serializeGalleryListingItem = (data: GalleryEventDoc) => {
  return {
    slug: data.slug,
    eventName: data.eventName,
    shortDesc: data.shortDesc,
    thumbnail: data.thumbnail,
    date: formatTimestamp(data.date),
  };
};

export const serializeGalleryDetail = (data: GalleryEventDoc): GalleryEventResponse => {
  return {
    slug: data.slug,
    eventName: data.eventName,
    shortDesc: data.shortDesc,
    thumbnail: data.thumbnail,
    images: data.images || [],
    date: formatTimestamp(data.date),
    createdAt: formatTimestamp(data.createdAt),
    updatedAt: formatTimestamp(data.updatedAt),
  };
};
