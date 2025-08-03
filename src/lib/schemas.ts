import { z } from "zod";

export const createEventSchema = z.discriminatedUnion("type", [
  // Schema for 'pageview' events
  z.object({
    type: z.literal("pageview"),
    tenantId: z.string().cuid(),
    hostname: z.string().min(1),
    path: z.string().min(1),
    referrer: z.string().optional(),
    screenWidth: z.number().int().positive().optional(),
    screenHeight: z.number().int().positive().optional(),
    utmSource: z.string().nullable().optional(),
    utmMedium: z.string().nullable().optional(),
    utmCampaign: z.string().nullable().optional(),
    utmTerm: z.string().nullable().optional(),
    utmContent: z.string().nullable().optional(),
  }),

  // Schema for 'goal' events
  z.object({
    type: z.literal("goal"),
    tenantId: z.string().cuid(),
    goalName: z.string().min(1),
  }),
]);

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
