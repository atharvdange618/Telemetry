import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { runInNewContext } from "node:vm";

// The tracker is plain browser JS with no exports, so run it in a vm context
// with just enough of window and document stubbed for it to start up.
const source = readFileSync(join(__dirname, "../public/analytics.js"), "utf8");

type Listener = () => void;
type SentEvent = Record<string, unknown>;

function loadTracker() {
  const sent: SentEvent[] = [];
  const listeners: Record<string, Listener[]> = {};
  const scripts: { onload?: Listener }[] = [];

  const ctx: Record<string, unknown> = {
    URL,
    URLSearchParams,
    navigator: { userAgent: "Mozilla/5.0 Chrome/129.0", language: "en-US" },
    sessionStorage: { getItem: () => "session-1", setItem: () => {} },
    location: { hostname: "site.test", pathname: "/post", search: "" },
    screen: { width: 1920, height: 1080 },
    pageYOffset: 0,
    performance: { getEntriesByType: () => [], getEntriesByName: () => [] },
    // Run the scroll throttle callback at once.
    setTimeout: (fn: Listener) => {
      fn();
      return null;
    },
    fetch: (_url: string, init: { body: string }) => {
      sent.push(JSON.parse(init.body) as SentEvent);
      return Promise.resolve({ status: 201 });
    },
    addEventListener: (type: string, fn: Listener) => {
      (listeners[type] ??= []).push(fn);
    },
    document: {
      currentScript: {
        src: "https://telemetry.test/analytics.js",
        getAttribute: (name: string) =>
          name === "data-tenant-id" ? "ctenant00000000000000001" : null,
      },
      referrer: "",
      visibilityState: "visible",
      documentElement: { scrollHeight: 2000, clientHeight: 1000, scrollTop: 0 },
      addEventListener: () => {},
      createElement: () => {
        const script: { onload?: Listener } = {};
        scripts.push(script);
        return script;
      },
      head: { appendChild: () => {} },
    },
  };
  ctx.window = ctx;

  runInNewContext(source, ctx);

  const fire = (type: string) => listeners[type]?.forEach((fn) => fn());
  const ofType = (type: string) => sent.filter((e) => e.type === type);
  return { ctx, fire, ofType, scripts };
}

describe("tracker scroll depth", () => {
  it("sends the max depth once on pagehide", () => {
    const { ctx, fire, ofType } = loadTracker();
    ctx.pageYOffset = 500;
    fire("scroll");

    fire("pagehide");
    fire("pagehide");

    expect(ofType("scroll")).toEqual([
      expect.objectContaining({ path: "/post", scrollDepth: 50 }),
    ]);
  });

  it("sends nothing when the visitor never scrolled", () => {
    const { fire, ofType } = loadTracker();
    fire("pagehide");
    expect(ofType("scroll")).toEqual([]);
  });
});

describe("tracker performance metrics", () => {
  it("keeps a CLS of 0 and leaves out metrics it never got", () => {
    const { ctx, fire, ofType, scripts } = loadTracker();
    ctx.webVitals = {
      onLCP: (cb: (m: { name: string; value: number }) => void) =>
        cb({ name: "LCP", value: 1200.4 }),
      onCLS: (cb: (m: { name: string; value: number }) => void) =>
        cb({ name: "CLS", value: 0 }),
      onINP: () => {},
    };
    scripts[0].onload?.();

    fire("pagehide");

    const [event] = ofType("performance");
    expect(event).toMatchObject({ lcp: 1200, cls: 0 });
    expect(event).not.toHaveProperty("inp");
  });
});
