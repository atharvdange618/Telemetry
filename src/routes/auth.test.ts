import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import type { FastifyInstance } from "fastify";
import { buildApp } from "../app";

vi.mock("../lib/prisma", () => ({ prisma: {} }));

describe("/logout", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    process.env.FRONTEND_URL = "https://dashboard.test";
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

  // Browsers only replace a cookie when the new one carries the same
  // attributes. Without SameSite=None the clearing cookie defaults to Lax,
  // and a cross-site dashboard's logout request would leave the session alive.
  it("clears the session cookie with the attributes it was set with", async () => {
    const res = await app.inject({ method: "GET", url: "/logout" });

    expect(res.statusCode).toBe(200);
    const header = String(res.headers["set-cookie"]);
    expect(header).toMatch(/^userId=;/);
    expect(header).toMatch(/Path=\//);
    expect(header).toMatch(/SameSite=None/);
    expect(header).toMatch(/Secure/);
    expect(header).toMatch(/HttpOnly/);
  });
});
