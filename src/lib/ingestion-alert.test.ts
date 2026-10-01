import { afterEach, describe, expect, it, vi } from "vitest";
import { prisma } from "./prisma";
import {
  findDrops,
  getTenantVolumes,
  sendDiscordAlert,
  type TenantVolume,
} from "./ingestion-alert";

vi.mock("./prisma", () => ({
  prisma: {
    event: { groupBy: vi.fn() },
    tenant: { findMany: vi.fn() },
  },
}));

const volume = (overrides: Partial<TenantVolume>): TenantVolume => ({
  tenantId: "t1",
  name: "Site",
  last24h: 100,
  dailyBaseline: 100,
  ...overrides,
});

describe("findDrops", () => {
  it("flags a site that fell below 30% of a normal day", () => {
    expect(findDrops([volume({ last24h: 29 })])).toHaveLength(1);
  });

  it("leaves a site at exactly 30% alone", () => {
    expect(findDrops([volume({ last24h: 30 })])).toHaveLength(0);
  });

  it("flags a site that went completely silent", () => {
    expect(findDrops([volume({ last24h: 0 })])).toHaveLength(1);
  });

  it("ignores sites too small for a drop to mean anything", () => {
    expect(findDrops([volume({ dailyBaseline: 19, last24h: 0 })])).toHaveLength(0);
    expect(findDrops([volume({ dailyBaseline: 20, last24h: 0 })])).toHaveLength(1);
  });
});

describe("getTenantVolumes", () => {
  it("averages the baseline over 7 days and includes silent sites", async () => {
    vi.mocked(prisma.event.groupBy)
      // groupBy's overloads don't fit a mocked return; the shape matches
      // what the function reads.
      .mockResolvedValueOnce([{ tenantId: "busy", _count: { _all: 50 } }] as never)
      .mockResolvedValueOnce([
        { tenantId: "busy", _count: { _all: 700 } },
        { tenantId: "silent", _count: { _all: 350 } },
      ] as never);
    vi.mocked(prisma.tenant.findMany).mockResolvedValue([
      { id: "busy", name: "Busy" },
      { id: "silent", name: "Silent" },
    ] as never);

    const volumes = await getTenantVolumes(new Date("2026-10-01T12:00:00Z"));

    expect(volumes).toEqual([
      { tenantId: "busy", name: "Busy", last24h: 50, dailyBaseline: 100 },
      { tenantId: "silent", name: "Silent", last24h: 0, dailyBaseline: 50 },
    ]);
  });
});

describe("sendDiscordAlert", () => {
  afterEach(() => vi.unstubAllGlobals());

  const stubFetch = (status = 204) => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status }));
    vi.stubGlobal("fetch", fetchMock);
    return fetchMock;
  };
  const sentBody = (fetchMock: ReturnType<typeof stubFetch>) =>
    JSON.parse(fetchMock.mock.calls[0][1].body as string);

  it("posts each site with its numbers and never allows mentions", async () => {
    const fetchMock = stubFetch();
    await sendDiscordAlert("https://discord.test/hook", [
      volume({ name: "@everyone", last24h: 3, dailyBaseline: 120.4 }),
    ]);

    const body = sentBody(fetchMock);
    expect(fetchMock.mock.calls[0][0]).toBe("https://discord.test/hook");
    expect(body.content).toContain("@everyone (t1): 3 events in the last 24h, usually about 120 a day");
    expect(body.allowed_mentions).toEqual({ parse: [] });
  });

  it("caps the list so the message stays under Discord's limit", async () => {
    const fetchMock = stubFetch();
    const drops = Array.from({ length: 40 }, (_, i) =>
      volume({ tenantId: `t${i}`, name: `Site ${i}` }),
    );
    await sendDiscordAlert("https://discord.test/hook", drops);

    const { content } = sentBody(fetchMock);
    expect(content).toContain("and 25 more");
    expect(content.length).toBeLessThan(2000);
  });

  it("throws when Discord rejects the webhook", async () => {
    stubFetch(404);
    await expect(
      sendDiscordAlert("https://discord.test/hook", [volume({})]),
    ).rejects.toThrow("Discord webhook returned 404");
  });
});
