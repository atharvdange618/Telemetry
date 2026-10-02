// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { createQueryClient } from "@/lib/query-client";
import { Navigation } from "./Navigation";

// jsdom has no matchMedia, and useDarkMode reads it on import.
vi.hoisted(() => {
  window.matchMedia = (query: string) =>
    ({ matches: false, media: query, addEventListener() {}, removeEventListener() {} }) as unknown as MediaQueryList;
});

let signedIn = false;
const fetchMock = vi.fn((input: RequestInfo | URL) => {
  const ok = String(input).endsWith("/me") && signedIn;
  const body = ok ? { user: { id: "u1", email: "a@b.test", name: null, image: null } } : {};
  return Promise.resolve(new Response(JSON.stringify(body), { status: ok ? 200 : 401 }));
});

function renderNav() {
  render(
    <QueryClientProvider client={createQueryClient()}>
      <MemoryRouter>
        <Navigation />
      </MemoryRouter>
    </QueryClientProvider>,
  );
}

beforeEach(() => {
  signedIn = false;
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("Navigation sign-in button", () => {
  it("links a signed-in user to the dashboard", async () => {
    signedIn = true;
    renderNav();
    const link = await screen.findByRole("link", { name: "Go to dashboard" });
    expect(link.getAttribute("href")).toBe("/dashboard");
    expect(screen.queryByRole("link", { name: /sign in/i })).toBeNull();
  });

  it("shows sign in to a signed-out visitor", async () => {
    renderNav();
    await vi.waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const link = screen.getByRole("link", { name: /sign in/i });
    expect(link.getAttribute("href")).toMatch(/\/login\/github$/);
    expect(screen.queryByRole("link", { name: "Go to dashboard" })).toBeNull();
  });
});
