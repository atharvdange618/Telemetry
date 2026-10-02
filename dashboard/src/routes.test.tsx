// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { createMemoryRouter, RouterProvider } from "react-router-dom";
import { createQueryClient } from "./lib/query-client";
import { useAuthStore } from "./lib/state/auth";
import { routes } from "./routes";

// Redirects are what's under test, so pages render their name and nothing else.
vi.mock("./pages/dashboard/OverviewPage", () => ({ default: () => <p>overview page</p> }));
vi.mock("./pages/dashboard/ContentPage", () => ({ default: () => <p>content page</p> }));
vi.mock("./pages/dashboard/SourcesPage", () => ({ default: () => null }));
vi.mock("./pages/dashboard/AudiencePage", () => ({ default: () => null }));
vi.mock("./pages/dashboard/ConversionsPage", () => ({ default: () => null }));
vi.mock("./pages/dashboard/PerformancePage", () => ({ default: () => null }));
vi.mock("./pages/SharedDashboardPage", () => ({ default: () => null }));
vi.mock("./pages/SitesPage", () => ({ default: () => <p>sites page</p> }));
vi.mock("./pages/Home", () => ({ default: () => <p>home page</p> }));

const SITES = [
  { id: "s1", name: "Site One", domains: ["https://one.test"] },
  { id: "s2", name: "Site Two", domains: ["https://two.test"] },
];

let tenants = SITES;
let signedIn = true;
const fetchMock = vi.fn((input: RequestInfo | URL) => {
  const url = String(input);
  const json = (body: unknown, status = 200) =>
    Promise.resolve(new Response(JSON.stringify(body), { status }));
  if (url.endsWith("/me")) return signedIn ? json({ user: { id: "u1" } }) : json({}, 401);
  if (url.endsWith("/api/tenants")) return json({ tenants });
  return json({});
});

function renderAt(url: string) {
  const router = createMemoryRouter(routes, { initialEntries: [url] });
  render(
    <QueryClientProvider client={createQueryClient()}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
  return router;
}

const at = (router: ReturnType<typeof renderAt>) =>
  router.state.location.pathname + router.state.location.search;

beforeEach(() => {
  tenants = SITES;
  signedIn = true;
  useAuthStore.setState({ user: null });
  fetchMock.mockClear();
  vi.stubGlobal("fetch", fetchMock);
  vi.stubGlobal(
    "matchMedia",
    vi.fn(() => ({ matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn() })),
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("dashboard redirects", () => {
  it("sends /dashboard to the first site's overview", async () => {
    const router = renderAt("/dashboard");
    await waitFor(() => expect(at(router)).toBe("/dashboard/s1/overview"));
  });

  it("moves old ?tenant= links onto the path and keeps the rest", async () => {
    const router = renderAt("/dashboard?tenant=s2&period=7d");
    await waitFor(() => expect(at(router)).toBe("/dashboard/s2/overview?period=7d"));
  });

  it("opens overview for a bare site path", async () => {
    const router = renderAt("/dashboard/s1?period=90d");
    await waitFor(() => expect(at(router)).toBe("/dashboard/s1/overview?period=90d"));
  });

  it("sends unknown page slugs to overview without looping", async () => {
    const router = renderAt("/dashboard/s1/foo?period=30d");
    await waitFor(() => expect(at(router)).toBe("/dashboard/s1/overview?period=30d"));
    expect(await screen.findByText("overview page")).toBeTruthy();
  });

  it("sends deeper unknown paths to overview too", async () => {
    const router = renderAt("/dashboard/s1/foo/bar?period=30d");
    await waitFor(() => expect(at(router)).toBe("/dashboard/s1/overview?period=30d"));
  });

  it("sends an unknown site to the first site, keeping the query, without fetching stats", async () => {
    const router = renderAt("/dashboard/gone/content?period=30d");
    await waitFor(() => expect(at(router)).toBe("/dashboard/s1/overview?period=30d"));
    const statsCalls = fetchMock.mock.calls.filter(([u]) => String(u).includes("/api/stats/"));
    expect(statsCalls).toEqual([]);
  });

  it("keeps the page title with a trailing slash", async () => {
    renderAt("/dashboard/s1/content/?period=30d");
    expect(await screen.findByRole("heading", { name: "Content" })).toBeTruthy();
    expect(screen.getByText("content page")).toBeTruthy();
  });

  it("sends an account with no sites to /sites", async () => {
    tenants = [];
    const router = renderAt("/dashboard");
    await waitFor(() => expect(at(router)).toBe("/sites"));
  });
});

describe("other routes", () => {
  it("redirects /settings to /sites", async () => {
    const router = renderAt("/settings");
    await waitFor(() => expect(at(router)).toBe("/sites"));
    expect(await screen.findByText("sites page")).toBeTruthy();
  });

  it("sends a signed-out visitor home", async () => {
    signedIn = false;
    const router = renderAt("/dashboard/s1/overview");
    await waitFor(() => expect(at(router)).toBe("/"));
  });
});
