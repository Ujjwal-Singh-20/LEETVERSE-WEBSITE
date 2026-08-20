import { z } from 'zod';

const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const projectMemberSnapshotSchema = z.object({
  username: z.string().trim().min(1, 'Member username is required'),
  name: z.string().trim().min(1, 'Member name is required'),
  photoUrl: z.string().url('Invalid member photo URL').or(z.literal('')).default(''),
});

export const createProjectSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(2, 'Slug must be at least 2 characters')
    .regex(slugRegex, 'Slug must be lowercase alphanumeric with hyphens (e.g. campus-connect)'),
  title: z.string().trim().min(1, 'Title is required'),
  description: z.string().trim().min(1, 'Description is required'),
  images: z.array(z.string().url('Invalid image URL')).default([]),
  members: z.array(projectMemberSnapshotSchema).default([]),
});

export const updateProjectSchema = createProjectSchema.partial().omit({ slug: true });

export const projectSlugParamSchema = z.object({
  slug: z.string().trim().min(1, 'Project slug is required'),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
