import { z } from 'zod';

const usernameRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const createMemberSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  username: z
    .string()
    .trim()
    .min(2, 'Username must be at least 2 characters')
    .max(50, 'Username cannot exceed 50 characters')
    .regex(usernameRegex, 'Username must be lowercase alphanumeric with hyphens (e.g. aditya-r)'),
  status: z.enum(['active', 'alumni'], {
    errorMap: () => ({ message: "Status must be either 'active' or 'alumni'" }),
  }),
  position: z.string().trim().min(1, 'Position is required'),
  bio: z.string().trim().default(''),
  photoUrl: z.string().url('Invalid photo URL').optional().nullable(),
  instagram: z.string().url('Invalid Instagram URL').optional().nullable(),
  linkedin: z.string().url('Invalid LinkedIn URL').optional().nullable(),
  github: z.string().url('Invalid GitHub URL').optional().nullable(),
  rollNo: z.string().trim().min(1, 'Roll number is required'),
});

export const updateMemberFieldSchema = z.object({
  field: z.enum([
    'name',
    'status',
    'position',
    'bio',
    'photoUrl',
    'instagram',
    'linkedin',
    'github',
    'rollNo',
  ]),
  value: z.union([z.string(), z.null()]),
}).refine(
  (data) => {
    if (data.field === 'status') {
      return data.value === 'active' || data.value === 'alumni';
    }
    if (['photoUrl', 'instagram', 'linkedin', 'github'].includes(data.field)) {
      if (data.value === null || data.value === '') return true;
      try {
        new URL(data.value);
        return true;
      } catch {
        return false;
      }
    }
    if (['name', 'position', 'rollNo'].includes(data.field)) {
      return typeof data.value === 'string' && data.value.trim().length > 0;
    }
    return true;
  },
  {
    message: 'Invalid field value',
    path: ['value'],
  }
);

export const checkUsernameQuerySchema = z.object({
  username: z
    .string()
    .trim()
    .min(2, 'Username must be at least 2 characters')
    .max(50, 'Username cannot exceed 50 characters')
    .regex(usernameRegex, 'Username must be lowercase alphanumeric with hyphens'),
});

export const memberParamsSchema = z.object({
  domain: z.string().trim().min(1, 'Domain slug is required'),
  docId: z.string().trim().min(1, 'Doc ID is required'),
});

export const usernameParamSchema = z.object({
  username: z.string().trim().min(1, 'Username is required'),
});

export type CreateMemberInput = z.infer<typeof createMemberSchema>;
export type UpdateMemberFieldInput = z.infer<typeof updateMemberFieldSchema>;
