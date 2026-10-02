import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { FastifyInstance } from "fastify";
import { prisma } from "../lib/prisma";
import { buildApp } from "../app";

vi.mock("../lib/prisma", () => ({
  prisma: {
    tenantUser: { findUnique: vi.fn() },
    event: { findMany: vi.fn() },
  },
}));

const TENANT = "csitea0000000000000000001";

describe("/api/stats/cohorts", () => {
  let app: FastifyInstance;
  let cookie: string;

  beforeAll(async () => {
    process.env.FRONTEND_URL = "https://dashboard.test";
    process.env.COOKIE_SECRET = "test-cookie-secret";
    process.env.VISITOR_SALT = "test-visitor-salt";
    process.env.GITHUB_CLIENT_ID = "test-client-id";
    process.env.GITHUB_CLIENT_SECRET = "test-client-secret";
    process.env.BASE_URL = "http://localhost:3000";
    app = buildApp();
    await app.ready();
    cookie = `userId=${app.signCookie("user-1")}`;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    vi.mocked(prisma.tenantUser.findUnique).mockReset().mockResolvedValue({
      userId: "user-1",
      tenantId: TENANT,
    } as never);
    // First call lists every pageview; the rest ask who came back each week.
    vi.mocked(prisma.event.findMany)
      .mockReset()
      .mockResolvedValueOnce([
        { visitorId: "v1", createdAt: new Date("2026-09-01T10:00:00Z") },
        { visitorId: "v2", createdAt: new Date("2026-09-02T10:00:00Z") },
      ] as never)
      .mockResolvedValue([{ visitorId: "v1" }] as never);
  });

  it("labels each row with its ISO week, not its visitor count", async () => {
    const res = await app.inject({
      method: "GET",
      url: `/api/stats/cohorts?tenantId=${TENANT}&startDate=2026-08-31T00:00:00Z&endDate=2026-10-02T00:00:00Z`,
      headers: { cookie },
    });

    expect(res.statusCode).toBe(200);
    const [row] = res.json().cohorts;
    expect(row.cohort).toBe("2026-W36");
    expect(row.totalVisitors).toBe(2);
    expect(row.week0).toBe(1);
  });
});
