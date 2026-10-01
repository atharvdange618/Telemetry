import { describe, expect, it } from "vitest";
import { tenantBodySchema } from "./schemas";

const parseDomains = (domains: string[]) =>
  tenantBodySchema.parse({ name: "My site", domains }).domains;

describe("tenantBodySchema domains", () => {
  it("stores bare origins, whatever form the URL arrives in", () => {
    expect(
      parseDomains([
        "https://site.com/",
        "https://Site.com/pricing?ref=x",
        "https://site.com:443",
        "http://localhost:3000/",
      ]),
    ).toEqual(["https://site.com", "http://localhost:3000"]);
  });

  it("removes duplicates that only differed in form", () => {
    expect(parseDomains(["https://a.com", "https://a.com/"])).toEqual(["https://a.com"]);
  });

  it("rejects anything that isn't an http(s) URL", () => {
    for (const bad of ["javascript:alert(1)", "ftp://a.com", "example.com", "not a url"]) {
      expect(tenantBodySchema.safeParse({ name: "My site", domains: [bad] }).success).toBe(false);
    }
  });

  it("leaves domains undefined when they aren't sent", () => {
    expect(tenantBodySchema.parse({ name: "My site" }).domains).toBeUndefined();
  });
});
