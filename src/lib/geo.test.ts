import { beforeEach, describe, expect, it, vi } from "vitest";
import type { FastifyBaseLogger } from "fastify";
import maxmind from "maxmind";

vi.mock("maxmind", () => ({ default: { open: vi.fn() } }));

const log = { warn: vi.fn() } as unknown as FastifyBaseLogger;

const records: Record<string, unknown> = {
  "203.0.113.7": { country: { names: { en: "India" } }, city: { names: { en: "Pune" } } },
  "203.0.113.8": { country: { names: { en: "The Netherlands" } } },
  "203.0.113.9": { country: { names: { en: "Türkiye" } } },
};

// Each test gets a fresh module, so a reader loaded in one never leaks into the next.
async function loadGeo() {
  vi.resetModules();
  return import("./geo");
}

describe("getGeoLocation", () => {
  beforeEach(() => {
    vi.mocked(maxmind.open).mockReset();
    vi.mocked(log.warn).mockReset();
  });

  it("reads country and city from the local database", async () => {
    vi.mocked(maxmind.open).mockResolvedValue({ get: (ip: string) => records[ip] ?? null } as never);
    const geo = await loadGeo();
    await geo.loadGeoDatabase("test.mmdb", log);

    expect(geo.getGeoLocation("203.0.113.7")).toEqual({ country: "India", city: "Pune" });
    expect(maxmind.open).toHaveBeenCalledWith("test.mmdb", expect.objectContaining({ watchForUpdates: true }));
  });

  it("keeps the country names already stored and used by the dashboard map", async () => {
    vi.mocked(maxmind.open).mockResolvedValue({ get: (ip: string) => records[ip] ?? null } as never);
    const geo = await loadGeo();
    await geo.loadGeoDatabase("test.mmdb", log);

    expect(geo.getGeoLocation("203.0.113.8")).toEqual({ country: "Netherlands", city: null });
    expect(geo.getGeoLocation("203.0.113.9")).toEqual({ country: "Turkey", city: null });
  });

  it("returns nulls for IPs the database doesn't know, like private ranges", async () => {
    vi.mocked(maxmind.open).mockResolvedValue({ get: () => null } as never);
    const geo = await loadGeo();
    await geo.loadGeoDatabase("test.mmdb", log);

    expect(geo.getGeoLocation("192.168.1.1")).toEqual({ country: null, city: null });
  });

  it("warns and returns nulls when the database file is missing", async () => {
    vi.mocked(maxmind.open).mockRejectedValue(new Error("ENOENT"));
    const geo = await loadGeo();
    await geo.loadGeoDatabase("missing.mmdb", log);

    expect(log.warn).toHaveBeenCalledOnce();
    expect(geo.getGeoLocation("203.0.113.7")).toEqual({ country: null, city: null });
  });
});
