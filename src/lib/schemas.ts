import { z } from "zod";

export const createEventSchema = z.object({
  tenantId: z.string().cuid({
    message: "Invalid tenant id",
  }),

  hostname: z.string().min(1, {
    message: "Hostname is required",
  }),

  path: z.string().min(1, {
    message: "Path is required",
  }),

  referrer: z.string().optional(),

  screenWidth: z.number().int().positive().optional(),
  screenHeight: z.number().int().positive().optional(),
});

export type CreateEventInput = z.infer<typeof createEventSchema>;
