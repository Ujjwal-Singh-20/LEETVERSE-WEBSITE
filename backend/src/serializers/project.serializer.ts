import { ProjectDoc, ProjectResponse } from '../types';

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

export const serializeProject = (data: ProjectDoc): ProjectResponse => {
  return {
    slug: data.slug,
    title: data.title,
    description: data.description,
    images: data.images || [],
    thumbnail: (data.images && data.images[0]) || '',
    members: data.members || [],
    createdAt: formatTimestamp(data.createdAt),
    updatedAt: formatTimestamp(data.updatedAt),
  };
};
