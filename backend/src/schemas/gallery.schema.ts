import { z } from 'zod';

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const createGalleryEventSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2, 'Slug must be at least 2 characters')
    .regex(slugRegex, 'Slug must be lowercase alphanumeric with hyphens (e.g. hackathon-2026)'),
  eventName: z.string().trim().min(1, 'Event name is required'),
  shortDesc: z.string().trim().min(1, 'Short description is required'),
  thumbnail: z.string().url('Invalid thumbnail URL'),
  images: z.array(z.string().url('Invalid image URL')).default([]),
  date: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Date must be a valid ISO 8601 string (e.g. 2026-03-15T00:00:00.000Z)',
  }),
});

export const updateGalleryEventSchema = createGalleryEventSchema.partial().omit({ slug: true });

export const gallerySlugParamSchema = z.object({
  slug: z.string().trim().min(1, 'Event slug is required'),
});

export type CreateGalleryEventInput = z.infer<typeof createGalleryEventSchema>;
export type UpdateGalleryEventInput = z.infer<typeof updateGalleryEventSchema>;
