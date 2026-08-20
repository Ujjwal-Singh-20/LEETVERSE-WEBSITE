import { z } from 'zod';

export const sessionLoginSchema = z.object({
  idToken: z.string().trim().min(1, 'Firebase ID token is required'),
});

export type SessionLoginInput = z.infer<typeof sessionLoginSchema>;
