import { z } from "zod";

const browserFields = {
  apiKey: z.string().optional(),
  browser: z.string().optional(),
  browserVersion: z.string().optional(),
  os: z.string().optional(),
  osVersion: z.string().optional(),
  language: z.string().optional(),
  sessionId: z.string().optional(),
};

export const createEventSchema = z.discriminatedUnion("type", [
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
    scrollDepth: z.number().int().min(0).max(100).optional(),
    ...browserFields,
  }),

  z.object({
    type: z.literal("goal"),
    tenantId: z.string().cuid(),
    goalName: z.string().min(1),
    properties: z.record(z.string(), z.unknown()).optional(),
    ...browserFields,
  }),

  z.object({
    type: z.literal("outbound"),
    tenantId: z.string().cuid(),
    url: z.string().url(),
    domain: z.string().min(1),
    path: z.string().optional(),
    ...browserFields,
  }),

  z.object({
    type: z.literal("performance"),
    tenantId: z.string().cuid(),
    path: z.string().optional(),
    lcp: z.number().nullable().optional(),
    fid: z.number().nullable().optional(),
    cls: z.number().nullable().optional(),
    ttfb: z.number().nullable().optional(),
    fcp: z.number().nullable().optional(),
    ...browserFields,
  }),

  z.object({
    type: z.literal("scroll"),
    tenantId: z.string().cuid(),
    path: z.string().optional(),
    scrollDepth: z.number().int().min(0).max(100),
    ...browserFields,
  }),
]);

export type CreateEventInput = z.infer<typeof createEventSchema>;

export const githubUserSchema = z.object({
  id: z.number(),
  login: z.string(),
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
  period: z.enum(["24h", "7d", "30d", "90d"]).default("24h"),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  browser: z.string().optional(),
  os: z.string().optional(),
  country: z.string().optional(),
  language: z.string().optional(),
  device: z.enum(["mobile", "tablet", "desktop"]).optional(),
  referrer: z.string().optional(),
  utmSource: z.string().optional(),
});

export const tenantBodySchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  domains: z.array(z.string().url()).optional(),
});

export const tenantParamsSchema = z.object({
  id: z.string().cuid(),
});

export const funnelBodySchema = z.object({
  tenantId: z.string().cuid(),
  steps: z.array(z.string().min(1)).min(2).max(10),
  period: z.enum(["24h", "7d", "30d", "90d"]).default("30d"),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

export const exportQuerySchema = z.object({
  tenantId: z.string().cuid(),
  format: z.enum(["csv", "json"]).default("json"),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  limit: z.coerce.number().int().min(1).max(100000).default(10000),
});

export const shareLinkBodySchema = z.object({
  tenantId: z.string().cuid(),
  label: z.string().max(100).optional(),
  config: z.object({
    period: z.enum(["24h", "7d", "30d", "90d"]).optional(),
    startDate: z.string().optional(),
    endDate: z.string().optional(),
    segments: z
      .object({
        browser: z.string().optional(),
        os: z.string().optional(),
        country: z.string().optional(),
        language: z.string().optional(),
        device: z.enum(["mobile", "tablet", "desktop"]).optional(),
      })
      .optional(),
  }),
});

export const shareLinkParamsSchema = z.object({
  id: z.string().cuid(),
});
