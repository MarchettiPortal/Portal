import { z } from 'zod';

export const setClpConfigSchema = z.object({
  ip: z.string().min(1),
  userID: z.string().min(1)
});