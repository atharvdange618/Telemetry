// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { Navigation } from "@/components/Navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import { createQueryClient } from "@/lib/query-client";
import { useAuthStore } from "@/lib/state/auth";
import { AccountMenu } from "./AccountMenu";

// jsdom has no matchMedia, and useDarkMode reads it on import.
vi.hoisted(() => {
  window.matchMedia = (query: string) =>
    ({ matches: false, media: query, addEventListener() {}, removeEventListener() {} }) as unknown as MediaQueryList;
});

const USER = { id: "u1", email: "a@b.test", name: "Ada", image: null };
let signedIn = true;
let logoutOk = true;
const fetchMock = vi.fn((input: RequestInfo | URL) => {
  const url = String(input);
  if (url.endsWith("/logout")) {
    if (logoutOk) signedIn = false;
    return Promise.resolve(new Response("{}", { status: logoutOk ? 200 : 500 }));
  }
  if (url.endsWith("/me") && signedIn) {
    return Promise.resolve(new Response(JSON.stringify({ user: USER }), { status: 200 }));
  }
  return Promise.resolve(new Response("{}", { status: 401 }));
});

function renderSignedIn() {
  const queryClient = createQueryClient();
  // What a signed-in session leaves behind in the cache.
  queryClient.setQueryData(["me"], { user: USER });
  queryClient.setQueryData(["tenants"], { tenants: [] });
  useAuthStore.setState({ user: USER });
  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={["/app"]}>
        <Routes>
          <Route path="/" element={<Navigation />} />
          <Route
            path="/app"
            element={
              <SidebarProvider>
                <AccountMenu />
              </SidebarProvider>
            }
          />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  );
  return queryClient;
}

async function logOut() {
  // Radix menus open from the keyboard in jsdom; pointer events need polyfills.
  fireEvent.keyDown(screen.getByRole("button", { name: /ada/i }), { key: "Enter" });
  fireEvent.click(await screen.findByRole("menuitem", { name: /log out/i }));
}

beforeEach(() => {
  signedIn = true;
  logoutOk = true;
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("AccountMenu log out", () => {
  it("shows the landing page as signed out without a reload", async () => {
    const queryClient = renderSignedIn();
    await logOut();

    expect(await screen.findByRole("link", { name: /sign in/i })).toBeTruthy();
    expect(screen.queryByRole("link", { name: "Go to dashboard" })).toBeNull();
    expect(useAuthStore.getState().user).toBeNull();
    expect(queryClient.getQueryData(["tenants"])).toBeUndefined();
  });

  it("keeps the session when the server refuses to log out", async () => {
    logoutOk = false;
    const queryClient = renderSignedIn();
    await logOut();

    await vi.waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(expect.stringMatching(/\/logout$/), expect.anything()),
    );
    expect(screen.getByRole("button", { name: /ada/i })).toBeTruthy();
    expect(useAuthStore.getState().user).toEqual(USER);
    expect(queryClient.getQueryData(["me"])).toEqual({ user: USER });
  });
});
