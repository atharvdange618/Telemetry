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

export const githubUserSchema = z.object({
  id: z.number(),
  name: z.string().nullable(),
  avatar_url: z.string().url(),
});

export const githubEmailSchema = z.object({
  email: z.string().email(),
  primary: z.boolean(),
  verified: z.boolean(),
});

export const statsQuerySchema = z.object({
  tenantId: z.string().cuid(),
  period: z.enum(["24h", "7d", "30d"]).default("24h"),
});

export const tenantBodySchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
});

export const tenantParamsSchema = z.object({
  id: z.string().cuid(),
});
