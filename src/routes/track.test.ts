import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { FastifyInstance } from "fastify";
import type { Tenant } from "../../generated/prisma";
import { prisma } from "../lib/prisma";
import { buildApp } from "../app";
import { isOriginAllowedForTenant } from "./track";

vi.mock("../lib/prisma", () => ({
  prisma: {
    tenant: { findUnique: vi.fn() },
    event: { create: vi.fn() },
  },
}));

const DASHBOARD = "https://dashboard.test";
const CHROME_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36";

// Stored with a trailing slash, the way older entries were saved.
const siteA: Tenant = {
  id: "csitea0000000000000000001",
  name: "Site A",
  apiKey: null,
  domains: ["https://site-a.test/"],
  createdAt: new Date(),
};

const pageview = {
  type: "pageview",
  tenantId: siteA.id,
  hostname: "site-a.test",
  path: "/",
};

describe("isOriginAllowedForTenant", () => {
  it("matches an exact origin", () => {
    expect(isOriginAllowedForTenant("https://a.test", ["https://a.test"])).toBe(true);
  });

  it("matches stored entries with a trailing slash or a page path", () => {
    expect(isOriginAllowedForTenant("https://a.test", ["https://a.test/"])).toBe(true);
    expect(isOriginAllowedForTenant("https://a.test", ["https://a.test/pricing?x=1"])).toBe(true);
  });

  it("rejects a different scheme, port, or subdomain", () => {
    const domains = ["https://a.test"];
    expect(isOriginAllowedForTenant("http://a.test", domains)).toBe(false);
    expect(isOriginAllowedForTenant("https://a.test:8443", domains)).toBe(false);
    expect(isOriginAllowedForTenant("https://www.a.test", domains)).toBe(false);
  });

  it("skips stored entries that aren't URLs instead of throwing", () => {
    expect(isOriginAllowedForTenant("https://a.test", ["not a url", "https://a.test"])).toBe(true);
    expect(isOriginAllowedForTenant("https://a.test", ["not a url"])).toBe(false);
  });

  it("allows nothing when the tenant has no domains", () => {
    expect(isOriginAllowedForTenant("https://a.test", [])).toBe(false);
  });
});

describe("/api/track", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    process.env.FRONTEND_URL = DASHBOARD;
    process.env.COOKIE_SECRET = "test-cookie-secret";
    process.env.VISITOR_SALT = "test-visitor-salt";
    process.env.GITHUB_CLIENT_ID = "test-client-id";
    process.env.GITHUB_CLIENT_SECRET = "test-client-secret";
    process.env.BASE_URL = "http://localhost:3000";
    app = buildApp();
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    vi.mocked(prisma.tenant.findUnique).mockReset().mockResolvedValue(siteA);
    vi.mocked(prisma.event.create).mockReset();
  });

  const track = (origin?: string) =>
    app.inject({
      method: "POST",
      url: "/api/track",
      headers: { "user-agent": CHROME_UA, ...(origin ? { origin } : {}) },
      payload: pageview,
    });

  describe("origin check", () => {
    it("stores events sent from one of the tenant's own domains", async () => {
      const res = await track("https://site-a.test");
      expect(res.statusCode).toBe(201);
      expect(prisma.event.create).toHaveBeenCalledOnce();
    });

    it("rejects another site's domain and says how to fix it", async () => {
      // site-b.test may be registered on some other tenant. That must not
      // let it send events into site A.
      const res = await track("https://site-b.test");
      expect(res.statusCode).toBe(403);
      expect(res.json().message).toBe(
        "https://site-b.test isn't an allowed domain for this site. Add it in Telemetry settings.",
      );
      expect(prisma.event.create).not.toHaveBeenCalled();
    });

    it("accepts server-side requests that send no Origin", async () => {
      const res = await track();
      expect(res.statusCode).toBe(201);
    });

    it("applies a newly added domain on the very next request", async () => {
      expect((await track("https://new.test")).statusCode).toBe(403);
      vi.mocked(prisma.tenant.findUnique).mockResolvedValueOnce({
        ...siteA,
        domains: [...siteA.domains, "https://new.test"],
      });
      expect((await track("https://new.test")).statusCode).toBe(201);
    });
  });

  describe("CORS", () => {
    const preflight = (url: string, origin: string) =>
      app.inject({
        method: "OPTIONS",
        url,
        headers: {
          origin,
          "access-control-request-method": "POST",
          "access-control-request-headers": "content-type",
        },
      });

    it("lets any origin preflight /api/track, without credentials", async () => {
      const res = await preflight("/api/track", "https://anywhere.test");
      expect(res.statusCode).toBe(204);
      expect(res.headers["access-control-allow-origin"]).toBe("https://anywhere.test");
      expect(res.headers["access-control-allow-credentials"]).toBeUndefined();
    });

    it("keeps credentialed dashboard routes limited to the dashboard origin", async () => {
      const fromSite = await preflight("/api/tenants", "https://site-a.test");
      expect(fromSite.headers["access-control-allow-origin"]).not.toBe("https://site-a.test");

      const fromDashboard = await preflight("/api/tenants", DASHBOARD);
      expect(fromDashboard.headers["access-control-allow-origin"]).toBe(DASHBOARD);
      expect(fromDashboard.headers["access-control-allow-credentials"]).toBe("true");
    });
  });
});
