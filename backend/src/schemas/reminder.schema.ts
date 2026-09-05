import { z } from 'zod';

export const reminderTargetSectionEnum = z.enum([
  'hero',
  'members',
  'projects',
  'gallery',
  'global',
]);

export const createReminderSchema = z
  .object({
    text: z.string().trim().min(1, 'Reminder message text is required'),
    startAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'startAt must be a valid ISO 8601 date string',
    }),
    endAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
      message: 'endAt must be a valid ISO 8601 date string',
    }),
    targetSection: reminderTargetSectionEnum.default('global'),
  })
  .refine(
    (data) => {
      const start = new Date(data.startAt).getTime();
      const end = new Date(data.endAt).getTime();
      return end > start;
    },
    {
      message: 'endAt must be strictly after startAt',
      path: ['endAt'],
    }
  );

export const reminderParamSchema = z.object({
  docId: z.string().trim().min(1, 'Reminder doc ID is required'),
});

export type CreateReminderInput = z.infer<typeof createReminderSchema>;
