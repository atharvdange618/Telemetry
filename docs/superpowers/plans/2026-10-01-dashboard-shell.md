# Dashboard Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single `/dashboard` page with a sidebar shell and six focused pages that each fetch only their own data.

**Architecture:** A pathless `AppLayout` route renders the shadcn sidebar around an `<Outlet />`. Under it, `/dashboard/:siteId` renders `StatsLayout` (top bar, filters, setup warning) around the six page routes, and `/sites` renders the site management page. The site id lives in the path and the range and filters live in the query string; pure functions in `lib/dashboard-params.ts` parse and build them, and two hooks (`useDashboardParams`, `useStat`) wrap those for components.

**Tech Stack:** React 19, react-router-dom 7 (`createBrowserRouter`), TanStack Query 5, Tailwind 4, shadcn (new-york), lucide-react, Vitest 5.

**Spec:** `docs/superpowers/specs/2026-10-01-dashboard-shell-design.md`

## Global Constraints

- All work happens in `dashboard/` unless a path says otherwise. Run commands from `dashboard/`.
- Strict TypeScript, no `any`. Use `unknown` when a type is truly unknown.
- New dependencies: `radix-ui` (runtime, via the shadcn CLI) and `vitest@^5` (dev). Nothing else.
- Keep the current visual style. No new colors, fonts or card looks.
- `/shared/:token` must look the same before and after.
- Filter and period changes write the URL with `replace: true`. Page and site changes push history.
- Commit messages: Conventional Commits with a scope, plain words, **no `Co-Authored-By` or any AI attribution trailer**.
- Commit only after Atharv says to commit. Each task ends at a commit step; stop there and ask.
- Pre-commit gate for every commit: `npm run lint`, `npx tsc -b`, `npm test` in `dashboard/`. All must pass.
- No em dashes in new UI copy or comments. The existing `"—"` empty-value placeholder in stat cards stays; it's a data value, not prose.

## Review Focus

1. **Hand-edited or stale URLs** (`?period=banana`, `?device=phone`, `?startDate=yesterday`): the page loads with defaults instead of sending bad params to the API. Pinned in Task 1 (`parseDashboardSearch` fallback tests).
2. **Half a custom range** (only `startDate` in the URL, or one date input cleared): the dashboard falls back to the preset period instead of breaking. Pinned in Task 1 (`isCustomRange` test) and Task 4 (`StatsLayout` ignores empty date input values).
3. **A deleted site's id in a bookmarked URL**: redirects to `/dashboard`, which then picks the first site. Checked by hand in Task 4, Step 9.
4. **A user with no sites** opening `/dashboard`: lands on `/sites` instead of a blank screen. Checked by hand in Task 4, Step 9.
5. **Mobile drawer after tapping a link**: the sheet closes on navigation instead of covering the new page. Handled in Task 4 (`AppSidebar` closes on `pathname` change), checked by hand in Task 4, Step 9.

---

## File Map

```
dashboard/
  package.json                          modify: add "test" script, vitest, radix-ui
  src/
    App.tsx                             modify: new route tree
    lib/
      dashboard-params.ts               create: pure URL <-> state functions
      dashboard-params.test.ts          create
      dashboard-pages.ts                create: the six pages (slug, title, icon)
      api.ts                            create: API_URL + fetchJSON
      utils.ts                          modify: add toOutboundRows
    hooks/
      useDashboardParams.ts             create
      useStat.ts                        create
      useTenants.ts                     create
      use-mobile.ts                     create (shadcn CLI)
    components/
      ui/sidebar.tsx, sheet.tsx,
         separator.tsx, skeleton.tsx    create (shadcn CLI)
      layout/
        AppLayout.tsx                   create: SidebarProvider + sidebar + outlet
        AppSidebar.tsx                  create
        SiteSwitcher.tsx                create
        AccountMenu.tsx                 create
        PageHeader.tsx                  create: sticky bar with SidebarTrigger
        StatsLayout.tsx                 create: top bar, filters, warning, outlet
        StatsToolbar.tsx                create: period, custom, filters, share, export
        SetupWarning.tsx                create
        DashboardIndexRedirect.tsx      create
      dashboard/
        TableCard.tsx                   create: one titled SimpleTable card
        GoalsSection.tsx                delete (Task 5)
        PagesReferrersSection.tsx       delete (Task 5)
        DashboardHeader.tsx             delete (Task 5)
    pages/
      dashboard/OverviewPage.tsx        create
      dashboard/ContentPage.tsx         create
      dashboard/SourcesPage.tsx         create
      dashboard/AudiencePage.tsx        create
      dashboard/ConversionsPage.tsx     create
      dashboard/PerformancePage.tsx     create
      SitesPage.tsx                     moved from components/SettingsPage.tsx
      SharedDashboardPage.tsx           modify: use TableCard
      DashboardPage.tsx                 delete (Task 5)
```

**Deviation from spec:** the spec names six card components (`GoalsCard`, `TopPagesCard` and so on). They would be the same card shell six times, so this plan uses one `TableCard` that takes the data as props.

---

### Task 1: URL state functions with tests

**Files:**
- Modify: `dashboard/package.json`
- Create: `dashboard/src/lib/dashboard-params.ts`
- Test: `dashboard/src/lib/dashboard-params.test.ts`

**Interfaces:**
- Consumes: `DateRange` from `@/lib/types/dashboard.types` (`{ period?: string; startDate?: string; endDate?: string }`)
- Produces:
  - `PERIODS`, `type Period = "24h" | "7d" | "30d" | "90d"`
  - `DEVICES`, `type Device = "mobile" | "tablet" | "desktop"`
  - `interface Segments { browser?: string; os?: string; country?: string; language?: string; device?: Device }`
  - `SEGMENT_KEYS: readonly ["browser", "os", "country", "language", "device"]`
  - `interface DashboardSearch { period: Period; startDate: string | null; endDate: string | null; segments: Segments }`
  - `parseDashboardSearch(search: URLSearchParams): DashboardSearch`
  - `isCustomRange(s: DashboardSearch): boolean`
  - `toDateRange(s: DashboardSearch): DateRange`
  - `toStatsQuery(siteId: string, s: DashboardSearch, timeZone: string, withSegments?: boolean): string`
  - `updateSearch(search: URLSearchParams, patch: Record<string, string | null>): URLSearchParams`
  - `legacyDashboardTarget(search: URLSearchParams): { siteId: string | null; search: string }`
  - `dashboardPath(siteId: string, page: string, search?: string): string`

- [ ] **Step 1: Install vitest and add the test script**

Run: `npm install -D vitest@^5`

Then add to `scripts` in `dashboard/package.json`:

```json
"test": "vitest run"
```

Vitest reads `vite.config.ts`, so the `@` alias works in tests with no extra config. Tests run in Node; nothing here touches the DOM.

- [ ] **Step 2: Write the failing tests**

Create `dashboard/src/lib/dashboard-params.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  dashboardPath,
  isCustomRange,
  legacyDashboardTarget,
  parseDashboardSearch,
  toDateRange,
  toStatsQuery,
  updateSearch,
} from "./dashboard-params";

const parse = (qs: string) => parseDashboardSearch(new URLSearchParams(qs));

describe("parseDashboardSearch", () => {
  it("defaults to 24h with no range or filters", () => {
    expect(parse("")).toEqual({
      period: "24h",
      startDate: null,
      endDate: null,
      segments: {},
    });
  });

  it("reads a preset period and filters", () => {
    expect(parse("period=7d&browser=Chrome&device=mobile")).toEqual({
      period: "7d",
      startDate: null,
      endDate: null,
      segments: { browser: "Chrome", device: "mobile" },
    });
  });

  it("falls back on unknown period and device values", () => {
    const s = parse("period=banana&device=phone");
    expect(s.period).toBe("24h");
    expect(s.segments).toEqual({});
  });

  it("drops dates that aren't YYYY-MM-DD", () => {
    const s = parse("startDate=yesterday&endDate=2026-10-01");
    expect(s.startDate).toBeNull();
    expect(s.endDate).toBe("2026-10-01");
  });
});

describe("isCustomRange and toDateRange", () => {
  it("needs both dates for a custom range", () => {
    const s = parse("period=7d&startDate=2026-09-01");
    expect(isCustomRange(s)).toBe(false);
    expect(toDateRange(s)).toEqual({ period: "7d" });
  });

  it("lets a custom range win over the period and cover whole local days", () => {
    const s = parse("period=7d&startDate=2026-09-01&endDate=2026-09-30");
    expect(isCustomRange(s)).toBe(true);
    expect(toDateRange(s)).toEqual({
      startDate: new Date(2026, 8, 1).toISOString(),
      endDate: new Date(2026, 8, 30, 23, 59, 59).toISOString(),
    });
  });
});

describe("toStatsQuery", () => {
  it("includes site, timezone, range and only the filters that are set", () => {
    const q = toStatsQuery("site1", parse("period=30d&os=iOS"), "Asia/Kolkata");
    expect(Object.fromEntries(new URLSearchParams(q))).toEqual({
      tenantId: "site1",
      tz: "Asia/Kolkata",
      period: "30d",
      os: "iOS",
    });
  });

  it("leaves filters out when asked, for the filter dropdown options", () => {
    const q = toStatsQuery("site1", parse("os=iOS"), "UTC", false);
    expect(new URLSearchParams(q).has("os")).toBe(false);
  });
});

describe("updateSearch", () => {
  it("sets keys, deletes null keys and leaves the input alone", () => {
    const input = new URLSearchParams("period=7d&browser=Chrome");
    const next = updateSearch(input, { period: "30d", browser: null });
    expect(next.toString()).toBe("period=30d");
    expect(input.toString()).toBe("period=7d&browser=Chrome");
  });
});

describe("legacyDashboardTarget", () => {
  it("moves tenant out of the query and keeps everything else", () => {
    const target = legacyDashboardTarget(
      new URLSearchParams(
        "tenant=abc&period=7d&startDate=2026-09-01&endDate=2026-09-30&browser=Chrome",
      ),
    );
    expect(target).toEqual({
      siteId: "abc",
      search: "period=7d&startDate=2026-09-01&endDate=2026-09-30&browser=Chrome",
    });
  });

  it("returns no site when the link has no tenant", () => {
    expect(legacyDashboardTarget(new URLSearchParams("period=7d"))).toEqual({
      siteId: null,
      search: "period=7d",
    });
  });
});

describe("dashboardPath", () => {
  it("keeps the query string, with or without its leading ?", () => {
    expect(dashboardPath("abc", "content", "?period=7d")).toBe(
      "/dashboard/abc/content?period=7d",
    );
    expect(dashboardPath("abc", "content", "period=7d")).toBe(
      "/dashboard/abc/content?period=7d",
    );
  });

  it("adds no ? when there is no query", () => {
    expect(dashboardPath("abc", "overview")).toBe("/dashboard/abc/overview");
    expect(dashboardPath("abc", "overview", "?")).toBe("/dashboard/abc/overview");
  });
});
```

- [ ] **Step 3: Run the tests to see them fail**

Run: `npm test`
Expected: FAIL, `Failed to resolve import "./dashboard-params"`.

- [ ] **Step 4: Write the implementation**

Create `dashboard/src/lib/dashboard-params.ts`:

```ts
import type { DateRange } from "@/lib/types/dashboard.types";

export const PERIODS = ["24h", "7d", "30d", "90d"] as const;
export type Period = (typeof PERIODS)[number];

export const DEVICES = ["mobile", "tablet", "desktop"] as const;
export type Device = (typeof DEVICES)[number];

export interface Segments {
  browser?: string;
  os?: string;
  country?: string;
  language?: string;
  device?: Device;
}

export const SEGMENT_KEYS = [
  "browser",
  "os",
  "country",
  "language",
  "device",
] as const satisfies readonly (keyof Segments)[];

// Everything about the dashboard view that lives in the query string.
export interface DashboardSearch {
  period: Period;
  // YYYY-MM-DD. A custom range needs both; the period stays so turning
  // Custom off returns to it.
  startDate: string | null;
  endDate: string | null;
  segments: Segments;
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isOneOf<T extends string>(list: readonly T[], value: string | null): value is T {
  return value !== null && (list as readonly string[]).includes(value);
}

// Bad or stale values fall back to defaults, so a hand-edited URL never
// sends something the API rejects.
export function parseDashboardSearch(search: URLSearchParams): DashboardSearch {
  const startDate = search.get("startDate");
  const endDate = search.get("endDate");
  const period = search.get("period");
  const device = search.get("device");

  const segments: Segments = {};
  for (const key of ["browser", "os", "country", "language"] as const) {
    const value = search.get(key);
    if (value) segments[key] = value;
  }
  if (isOneOf(DEVICES, device)) segments.device = device;

  return {
    period: isOneOf(PERIODS, period) ? period : "24h",
    startDate: startDate && DATE_PATTERN.test(startDate) ? startDate : null,
    endDate: endDate && DATE_PATTERN.test(endDate) ? endDate : null,
    segments,
  };
}

export function isCustomRange(s: DashboardSearch): boolean {
  return s.startDate !== null && s.endDate !== null;
}

// A custom range runs from local midnight on the start day to the last
// second of the end day, so it covers whole days where the viewer is.
export function toDateRange(s: DashboardSearch): DateRange {
  if (s.startDate && s.endDate) {
    return {
      startDate: new Date(`${s.startDate}T00:00:00`).toISOString(),
      endDate: new Date(`${s.endDate}T23:59:59`).toISOString(),
    };
  }
  return { period: s.period };
}

// The query string for /api/stats/*. withSegments=false is for the filter
// dropdowns, so picking one browser doesn't hide every other browser.
export function toStatsQuery(
  siteId: string,
  s: DashboardSearch,
  timeZone: string,
  withSegments = true,
): string {
  const params = new URLSearchParams({ tenantId: siteId, tz: timeZone });
  for (const [key, value] of Object.entries(toDateRange(s))) {
    if (value) params.set(key, value);
  }
  if (withSegments) {
    for (const key of SEGMENT_KEYS) {
      const value = s.segments[key];
      if (value) params.set(key, value);
    }
  }
  return params.toString();
}

// Returns a copy with each key set, or deleted when its value is null or "".
export function updateSearch(
  search: URLSearchParams,
  patch: Record<string, string | null>,
): URLSearchParams {
  const next = new URLSearchParams(search);
  for (const [key, value] of Object.entries(patch)) {
    if (value) next.set(key, value);
    else next.delete(key);
  }
  return next;
}

// Links from before the sidebar put the site in ?tenant=.
export function legacyDashboardTarget(search: URLSearchParams): {
  siteId: string | null;
  search: string;
} {
  const rest = new URLSearchParams(search);
  const siteId = rest.get("tenant");
  rest.delete("tenant");
  return { siteId, search: rest.toString() };
}

export function dashboardPath(siteId: string, page: string, search = ""): string {
  const query = search.replace(/^\?/, "");
  return `/dashboard/${encodeURIComponent(siteId)}/${page}${query ? `?${query}` : ""}`;
}
```

Note: the old page parsed a custom start date with `new Date("YYYY-MM-DD")`, which JavaScript reads as UTC midnight, while it read the end date as local time. `toDateRange` reads both as local time. That's a deliberate fix, pinned by the test above.

- [ ] **Step 5: Run the tests to see them pass**

Run: `npm test`
Expected: PASS, 13 tests.

- [ ] **Step 6: Run the gate and commit (after Atharv says to commit)**

Run: `npm run lint && npx tsc -b && npm test`
Expected: all pass.

```bash
git add dashboard/package.json dashboard/package-lock.json dashboard/src/lib/dashboard-params.ts dashboard/src/lib/dashboard-params.test.ts
git commit -m "feat(dashboard): add URL state parsing for the dashboard shell" -m "Site id moves to the path and range and filters stay in the query string. These pure functions parse and build both, with bad values falling back to defaults. Adds vitest to the dashboard to test them."
```

---

### Task 2: Install the shadcn sidebar

**Files:**
- Create (CLI): `src/components/ui/sidebar.tsx`, `src/components/ui/sheet.tsx`, `src/components/ui/separator.tsx`, `src/components/ui/skeleton.tsx`, `src/hooks/use-mobile.ts`
- Modify (CLI): `package.json`, `package-lock.json`, maybe `src/index.css`
- Must stay unchanged: `src/components/ui/button.tsx`, `tooltip.tsx`, `input.tsx`

**Interfaces:**
- Produces: `SidebarProvider`, `Sidebar`, `SidebarHeader`, `SidebarContent`, `SidebarFooter`, `SidebarGroup`, `SidebarGroupLabel`, `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`, `SidebarInset`, `SidebarTrigger`, `useSidebar` from `@/components/ui/sidebar`.

- [ ] **Step 1: Run the CLI**

Run: `npx shadcn@latest add sidebar --overwrite --yes`

`--overwrite` keeps the CLI from hanging on prompts. It will overwrite `button.tsx`, `tooltip.tsx` and `input.tsx`, which have local edits. Step 2 restores them.

- [ ] **Step 2: Restore the local UI components**

Run: `git checkout -- src/components/ui/button.tsx src/components/ui/tooltip.tsx src/components/ui/input.tsx`

Then run `git status --short` and `git diff src/index.css`.
Expected: new files listed above, `package.json` gains `radix-ui`, and `index.css` either has no diff or only adds `--sidebar-*` values. The `--color-sidebar-*` theme mappings already exist at `src/index.css:34-41`. If the CLI added duplicate `--sidebar-*` blocks to `:root` or `.dark`, keep one copy of each.

- [ ] **Step 3: Check that sidebar.tsx compiles against the local components**

Run: `npx tsc -b`
Expected: no errors.

If `sidebar.tsx` uses a `Button` size or variant the local `button.tsx` lacks, change the call in `sidebar.tsx` to the nearest existing one. Don't edit `button.tsx`.

- [ ] **Step 4: Run the gate and commit (after Atharv says to commit)**

Run: `npm run lint && npx tsc -b && npm test`
Expected: all pass. If lint flags the generated files only for `react-refresh/only-export-components`, that matches how shadcn ships them; add `// eslint-disable-next-line react-refresh/only-export-components` above the offending export rather than restructuring generated code.

```bash
git add dashboard/package.json dashboard/package-lock.json dashboard/src/components/ui dashboard/src/hooks/use-mobile.ts dashboard/src/index.css
git commit -m "chore(dashboard): add shadcn sidebar component" -m "Adds sidebar, sheet, separator, skeleton and use-mobile from the shadcn registry, plus the radix-ui package they need. The existing button, tooltip and input stay as they were."
```

---

### Task 3: One table card for the shared view

**Files:**
- Create: `dashboard/src/components/dashboard/TableCard.tsx`
- Modify: `dashboard/src/lib/utils.ts` (add `toOutboundRows`)
- Modify: `dashboard/src/pages/SharedDashboardPage.tsx:305-318` and its imports

**Interfaces:**
- Consumes: `SimpleTable` from `./SimpleTable` (`{ data: object[]; labelKey: string; valueKey: string; valueLabel: string; maxRows?: number }`)
- Produces:
  - `TableCard(props: { title: string; icon: LucideIcon; data: object[]; labelKey: string; valueKey: string; valueLabel: string; limit?: number; moreHref?: string; className?: string })`
  - `toOutboundRows(data: OutboundResponse | undefined): { url: string; clicks: number }[]` in `@/lib/utils`

- [ ] **Step 1: Add `toOutboundRows` to `src/lib/utils.ts`**

Append:

```ts
// Outbound links show by hostname; the full URL is too long for a table row.
export function toOutboundRows(
  data: OutboundResponse | undefined,
): { url: string; clicks: number }[] {
  return (data?.outboundLinks ?? []).map((o) => ({
    url: new URL(o.url).hostname,
    clicks: o.clicks,
  }));
}
```

And add at the top: `import type { OutboundResponse } from "@/lib/types/dashboard.types";`

- [ ] **Step 2: Create `TableCard.tsx`**

```tsx
import { Link } from "react-router-dom";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { SimpleTable } from "./SimpleTable";

interface TableCardProps {
  title: string;
  icon: LucideIcon;
  data: object[];
  labelKey: string;
  valueKey: string;
  valueLabel: string;
  /** Show only the first N rows, for previews. */
  limit?: number;
  /** Adds a "View all" link in the header. */
  moreHref?: string;
  className?: string;
}

export function TableCard({
  title,
  icon: Icon,
  data,
  labelKey,
  valueKey,
  valueLabel,
  limit,
  moreHref,
  className,
}: TableCardProps) {
  return (
    <Card className={cn("transition-all duration-300 hover:border-border/20", className)}>
      <CardHeader className="flex flex-row items-center gap-2">
        <div className="p-1.5 rounded-lg bg-primary/8">
          <Icon className="h-3.5 w-3.5 text-primary/70" />
        </div>
        <CardTitle className="text-base">{title}</CardTitle>
        {moreHref && (
          <Link
            to={moreHref}
            className="ml-auto text-xs text-muted-foreground hover:text-foreground"
          >
            View all
          </Link>
        )}
      </CardHeader>
      <CardContent>
        <SimpleTable
          data={limit ? data.slice(0, limit) : data}
          labelKey={labelKey}
          valueKey={valueKey}
          valueLabel={valueLabel}
        />
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 3: Switch `SharedDashboardPage` to `TableCard`, same arrangement**

Replace the `PagesReferrersSection` and `GoalsSection` imports with:

```tsx
import { TableCard } from "@/components/dashboard/TableCard";
import { toOutboundRows } from "@/lib/utils";
import { ExternalLink, FileText, Link2, MapPin, Megaphone, Target } from "lucide-react";
```

(Merge the lucide names into the existing `lucide-react` import.)

Replace `<PagesReferrersSection pages={pages} referrers={referrers} />` with:

```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
  <TableCard
    className="lg:col-span-2"
    title="Top Pages"
    icon={FileText}
    data={pages?.pages ?? []}
    labelKey="path"
    valueKey="views"
    valueLabel="Views"
  />
  <TableCard
    title="Top Referrers"
    icon={Link2}
    data={referrers?.referrers ?? []}
    labelKey="referrer"
    valueKey="views"
    valueLabel="Views"
  />
</div>
```

Replace the `<GoalsSection ... />` block with:

```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <TableCard
    title="Top Goals"
    icon={Target}
    data={goalsData?.goals ?? []}
    labelKey="name"
    valueKey="completions"
    valueLabel="Count"
  />
  <TableCard
    title="Top Sources"
    icon={Megaphone}
    data={sourcesData?.sources ?? []}
    labelKey="source"
    valueKey="views"
    valueLabel="Views"
  />
  <TableCard
    title="Top Cities"
    icon={MapPin}
    data={citiesData?.cities ?? []}
    labelKey="city"
    valueKey="views"
    valueLabel="Views"
  />
  <TableCard
    title="Outbound Links"
    icon={ExternalLink}
    data={toOutboundRows(outboundData)}
    labelKey="url"
    valueKey="clicks"
    valueLabel="Clicks"
  />
</div>
```

- [ ] **Step 4: Verify the share view looks the same**

Run: `npx tsc -b` (expected: no errors), then `npm run dev`. With the API running (`docker compose up` from the repo root, or `npm run dev` in the root), create a share link from the current dashboard and open `/shared/<token>`.
Expected: same cards, same order, same grid as before this task.

- [ ] **Step 5: Run the gate and commit (after Atharv says to commit)**

Run: `npm run lint && npx tsc -b && npm test`

```bash
git add dashboard/src/components/dashboard/TableCard.tsx dashboard/src/lib/utils.ts dashboard/src/pages/SharedDashboardPage.tsx
git commit -m "refactor(dashboard): render table cards from one component" -m "GoalsSection and PagesReferrersSection bundled unrelated tables, which the new pages need apart. TableCard renders one titled table; the shared view uses it in the same arrangement as before."
```

---

### Task 4: App shell, routing and the Overview page

**Files:**
- Create: `src/lib/api.ts`, `src/lib/dashboard-pages.ts`
- Create: `src/hooks/useTenants.ts`, `src/hooks/useDashboardParams.ts`, `src/hooks/useStat.ts`
- Create: `src/components/layout/{AppLayout,AppSidebar,SiteSwitcher,AccountMenu,PageHeader,StatsLayout,StatsToolbar,SetupWarning,DashboardIndexRedirect}.tsx`
- Create: `src/pages/dashboard/OverviewPage.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: everything Task 1 produces; `TableCard` (Task 3); sidebar exports (Task 2); existing `FiltersBar`, `ShareButton`, `StatCard`, `InsightCards`, `AnalyticsChart`, `SEO`, `useDarkMode`, `useAuthStore`.
- Produces:
  - `API_URL: string`, `fetchJSON<T>(url: string): Promise<T>` in `@/lib/api`
  - `DASHBOARD_PAGES: DashboardPageInfo[]`, `interface DashboardPageInfo { slug: string; title: string; icon: LucideIcon }` in `@/lib/dashboard-pages`
  - `useTenants(): UseQueryResult<TenantsResponse>`
  - `useDashboardParams()` returning `{ siteId, searchParams, search, range, customRange, statsQuery, optionsQuery, setPeriod, setCustomRange, clearCustomRange, setSegment, clearSegments }`
  - `useStat<T>(name: string, opts?: { unfiltered?: boolean; enabled?: boolean }): UseQueryResult<T>`
  - `PageHeader({ title: string; status?: string; children?: ReactNode })`
  - Layout route components: `AppLayout`, `StatsLayout`, `DashboardIndexRedirect`

- [ ] **Step 1: Create the small shared modules**

`src/lib/api.ts`:

```ts
export const API_URL: string = import.meta.env.VITE_API_URL;

export async function fetchJSON<T>(url: string): Promise<T> {
  const res = await fetch(url, { credentials: "include" });
  if (!res.ok) throw new Error("Network response was not ok");
  return (await res.json()) as T;
}
```

`src/lib/dashboard-pages.ts`:

```ts
import {
  FileText,
  Gauge,
  LayoutDashboard,
  Link2,
  Target,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface DashboardPageInfo {
  slug: string;
  title: string;
  icon: LucideIcon;
}

export const DASHBOARD_PAGES: DashboardPageInfo[] = [
  { slug: "overview", title: "Overview", icon: LayoutDashboard },
  { slug: "content", title: "Content", icon: FileText },
  { slug: "sources", title: "Sources", icon: Link2 },
  { slug: "audience", title: "Audience", icon: Users },
  { slug: "conversions", title: "Conversions", icon: Target },
  { slug: "performance", title: "Performance", icon: Gauge },
];
```

`src/hooks/useTenants.ts`:

```ts
import { useQuery } from "@tanstack/react-query";
import { API_URL, fetchJSON } from "@/lib/api";
import type { TenantsResponse } from "@/lib/types/dashboard.types";

// Same key the Sites page uses, so both share one cached list.
export function useTenants() {
  return useQuery<TenantsResponse>({
    queryKey: ["tenants"],
    queryFn: () => fetchJSON<TenantsResponse>(`${API_URL}/api/tenants`),
  });
}
```

- [ ] **Step 2: Create `useDashboardParams` and `useStat`**

`src/hooks/useDashboardParams.ts`:

```ts
import { useMemo } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import {
  SEGMENT_KEYS,
  isCustomRange,
  parseDashboardSearch,
  toDateRange,
  toStatsQuery,
  updateSearch,
  type Period,
  type Segments,
} from "@/lib/dashboard-params";

// So chart days start at the viewer's midnight, not the server's.
const TIME_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;

// The URL is the only state: the site from the path, everything else from
// the query string. Setters replace the history entry, so filter tweaks
// don't fill the back button.
export function useDashboardParams() {
  const { siteId = "" } = useParams<{ siteId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();

  const search = useMemo(() => parseDashboardSearch(searchParams), [searchParams]);
  const range = useMemo(() => toDateRange(search), [search]);
  const statsQuery = useMemo(
    () => toStatsQuery(siteId, search, TIME_ZONE),
    [siteId, search],
  );
  const optionsQuery = useMemo(
    () => toStatsQuery(siteId, search, TIME_ZONE, false),
    [siteId, search],
  );

  const patch = (changes: Record<string, string | null>) =>
    setSearchParams((prev) => updateSearch(prev, changes), { replace: true });

  return {
    siteId,
    searchParams,
    search,
    range,
    customRange: isCustomRange(search),
    statsQuery,
    optionsQuery,
    setPeriod: (period: Period) =>
      patch({ period, startDate: null, endDate: null }),
    setCustomRange: (startDate: string, endDate: string) =>
      patch({ startDate, endDate }),
    clearCustomRange: () => patch({ startDate: null, endDate: null }),
    setSegment: (key: keyof Segments, value: string) =>
      patch({ [key]: value || null }),
    clearSegments: () =>
      patch(Object.fromEntries(SEGMENT_KEYS.map((key) => [key, null]))),
  };
}
```

`src/hooks/useStat.ts`:

```ts
import { useQuery } from "@tanstack/react-query";
import { API_URL, fetchJSON } from "@/lib/api";
import { useDashboardParams } from "./useDashboardParams";

interface UseStatOptions {
  /** Ignore the active filters. For the filter dropdown options. */
  unfiltered?: boolean;
  enabled?: boolean;
}

// One /api/stats/<name> request for the current site, range and filters.
// With no filter active, unfiltered and filtered calls share a cache key,
// so the filter dropdowns cost no extra requests.
export function useStat<T>(name: string, { unfiltered = false, enabled = true }: UseStatOptions = {}) {
  const { siteId, search, statsQuery, optionsQuery } = useDashboardParams();
  const segments = unfiltered ? {} : search.segments;

  return useQuery<T>({
    queryKey: ["stats", siteId, search.period, search.startDate, search.endDate, segments, name],
    queryFn: () =>
      fetchJSON<T>(`${API_URL}/api/stats/${name}?${unfiltered ? optionsQuery : statsQuery}`),
    enabled: enabled && siteId !== "",
  });
}
```

- [ ] **Step 3: Create `PageHeader`, `SetupWarning` and `StatsToolbar`**

`src/components/layout/PageHeader.tsx`:

```tsx
import type { ReactNode } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface PageHeaderProps {
  title: string;
  /** Short status under the title, read out by screen readers. */
  status?: string;
  children?: ReactNode;
}

export function PageHeader({ title, status, children }: PageHeaderProps) {
  return (
    <header className="sticky top-0 z-20 flex flex-wrap items-center gap-2 border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:px-6">
      <SidebarTrigger className="-ml-1" />
      <div className="mr-auto min-w-0">
        <h1 className="truncate text-lg font-semibold font-heading">{title}</h1>
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {status}
        </p>
      </div>
      {children}
    </header>
  );
}
```

`src/components/layout/SetupWarning.tsx` (moved from `DashboardPage.tsx:427-449`):

```tsx
import { AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function SetupWarning({ siteName }: { siteName: string }) {
  const navigate = useNavigate();
  return (
    <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-500 text-sm flex flex-col sm:flex-row gap-3 sm:items-center">
      <div className="flex gap-3 items-start flex-1">
        <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold">Finish setting up {siteName}</p>
          <p className="text-muted-foreground mt-0.5 leading-relaxed">
            The tracking script's events are blocked until you add your
            site's domain, so this dashboard will stay empty.
          </p>
        </div>
      </div>
      <Button size="sm" variant="outline" onClick={() => navigate("/sites")}>
        Add domain
      </Button>
    </div>
  );
}
```

`src/components/layout/StatsToolbar.tsx` (controls moved from `DashboardHeader.tsx:117-187`):

```tsx
import { Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ShareButton } from "@/components/dashboard/ShareButton";
import { PERIODS, type Period } from "@/lib/dashboard-params";

interface StatsToolbarProps {
  siteId: string;
  searchParams: URLSearchParams;
  period: Period;
  customRange: boolean;
  showFilters: boolean;
  hasActiveFilters: boolean;
  onSetPeriod: (period: Period) => void;
  onToggleCustomRange: () => void;
  onToggleFilters: () => void;
  onExport: (format: "csv" | "json") => void;
}

export function StatsToolbar({
  siteId,
  searchParams,
  period,
  customRange,
  showFilters,
  hasActiveFilters,
  onSetPeriod,
  onToggleCustomRange,
  onToggleFilters,
  onExport,
}: StatsToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex rounded-full border border-border bg-muted/30 p-0.5">
        {PERIODS.map((p) => (
          <button
            key={p}
            onClick={() => onSetPeriod(p)}
            className={`h-7 px-3 text-xs font-medium rounded-full transition-all duration-200 ${
              period === p && !customRange
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {p}
          </button>
        ))}
      </div>

      <Button
        variant={customRange ? "default" : "outline"}
        size="sm"
        onClick={onToggleCustomRange}
        className="h-8"
      >
        Custom
      </Button>

      <Button
        variant={showFilters ? "default" : "outline"}
        size="sm"
        onClick={onToggleFilters}
        className="gap-1 h-8"
        aria-label="Filters"
        title="Filters"
      >
        <Filter className="h-3.5 w-3.5" />
        {hasActiveFilters && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
      </Button>

      <ShareButton tenantId={siteId} searchParams={searchParams} currentPeriod={period} />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            aria-label="Export data"
            title="Export data"
          >
            <Download className="h-3.5 w-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => onExport("csv")}>Export CSV</DropdownMenuItem>
          <DropdownMenuItem onSelect={() => onExport("json")}>Export JSON</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
```

- [ ] **Step 4: Create `StatsLayout`**

`src/components/layout/StatsLayout.tsx`:

```tsx
import { useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useIsFetching } from "@tanstack/react-query";
import { SEO } from "@/components/SEO";
import { FiltersBar } from "@/components/dashboard/FiltersBar";
import { useDashboardParams } from "@/hooks/useDashboardParams";
import { useStat } from "@/hooks/useStat";
import { useTenants } from "@/hooks/useTenants";
import { API_URL } from "@/lib/api";
import { DASHBOARD_PAGES } from "@/lib/dashboard-pages";
import { toDateInputValue } from "@/lib/utils";
import type {
  BrowsersResponse,
  LanguagesResponse,
  LocationsResponse,
  OsResponse,
} from "@/lib/types/dashboard.types";
import { PageHeader } from "./PageHeader";
import { SetupWarning } from "./SetupWarning";
import { StatsToolbar } from "./StatsToolbar";

export function StatsLayout() {
  const params = useDashboardParams();
  const { siteId, search, customRange } = params;
  const { pathname } = useLocation();
  const { data: tenantsData } = useTenants();
  const [showFilters, setShowFilters] = useState(false);
  // Old data stays on screen while a new period or filter loads, so say so.
  const isUpdating = useIsFetching({ queryKey: ["stats"] }) > 0;

  const optionsOpts = { unfiltered: true, enabled: showFilters };
  const browserOptions = useStat<BrowsersResponse>("browsers", optionsOpts);
  const osOptions = useStat<OsResponse>("os", optionsOpts);
  const locationOptions = useStat<LocationsResponse>("locations", optionsOpts);
  const languageOptions = useStat<LanguagesResponse>("languages", optionsOpts);

  const site = tenantsData?.tenants.find((t) => t.id === siteId);
  // A deleted site, or one this account can't see.
  if (tenantsData && !site) return <Navigate to="/dashboard" replace />;

  const page = DASHBOARD_PAGES.find((p) => pathname.endsWith(`/${p.slug}`));
  const hasActiveFilters = Object.values(search.segments).some(Boolean);

  const toggleCustomRange = () => {
    if (customRange) return params.clearCustomRange();
    // Start from the period on screen, so turning Custom on never shows a
    // blank range while the data still reflects the old period.
    const days = search.period === "24h" ? 1 : parseInt(search.period);
    const now = new Date();
    const start = new Date(now);
    start.setDate(now.getDate() - days);
    params.setCustomRange(toDateInputValue(start), toDateInputValue(now));
  };

  const handleExport = (format: "csv" | "json") => {
    // Same range and filters as the dashboard, so the file matches the screen.
    const query = new URLSearchParams(params.statsQuery);
    query.set("format", format);
    window.open(`${API_URL}/api/export/events?${query.toString()}`, "_blank");
  };

  return (
    <>
      <SEO
        title={`${site?.name ?? "Dashboard"} ${page?.title ?? ""}`.trim()}
        description="View privacy-friendly website analytics."
        noindex={true}
      />
      <PageHeader title={page?.title ?? ""} status={isUpdating ? "Updating…" : undefined}>
        <StatsToolbar
          siteId={siteId}
          searchParams={params.searchParams}
          period={search.period}
          customRange={customRange}
          showFilters={showFilters}
          hasActiveFilters={hasActiveFilters}
          onSetPeriod={params.setPeriod}
          onToggleCustomRange={toggleCustomRange}
          onToggleFilters={() => setShowFilters(!showFilters)}
          onExport={handleExport}
        />
      </PageHeader>

      <div className="space-y-6 p-4 md:p-6">
        <FiltersBar
          show={showFilters}
          customRange={customRange}
          startDate={search.startDate ?? ""}
          endDate={search.endDate ?? ""}
          segments={search.segments}
          browsersData={browserOptions.data}
          osData={osOptions.data}
          locationsData={locationOptions.data}
          languagesData={languageOptions.data}
          hasActiveFilters={hasActiveFilters}
          // A cleared date input sends "". Ignore it rather than dropping
          // out of the custom range mid-edit.
          onSetStartDate={(v) => v && params.setCustomRange(v, search.endDate ?? v)}
          onSetEndDate={(v) => v && params.setCustomRange(search.startDate ?? v, v)}
          onSetSegment={params.setSegment}
          onClearSegments={params.clearSegments}
        />
        {site && site.domains.length === 0 && <SetupWarning siteName={site.name} />}
        <Outlet />
      </div>
    </>
  );
}
```

Note: the `…` in "Updating…" is a single ellipsis character, as in the existing header. It's not a dash.

- [ ] **Step 5: Create the sidebar pieces**

`src/components/layout/SiteSwitcher.tsx`:

```tsx
import { ChevronsUpDown, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";
import type { Tenant } from "@/lib/types/dashboard.types";

interface SiteSwitcherProps {
  tenants: Tenant[];
  activeSite: Tenant | undefined;
  onSelect: (siteId: string) => void;
}

export function SiteSwitcher({ tenants, activeSite, onSelect }: SiteSwitcherProps) {
  const navigate = useNavigate();
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton size="lg" tooltip="Switch site">
              <img src="/logo.svg" alt="" className="h-6 w-6 shrink-0" />
              <span className="truncate font-semibold">{activeSite?.name ?? "Select a site"}</span>
              <ChevronsUpDown className="ml-auto h-4 w-4 text-muted-foreground" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Your sites</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {tenants.map((tenant) => (
              <DropdownMenuItem
                key={tenant.id}
                onSelect={() => onSelect(tenant.id)}
                className={tenant.id === activeSite?.id ? "bg-accent" : undefined}
              >
                {tenant.name}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => navigate("/sites")}>
              <Plus className="h-4 w-4 mr-2" /> Add site
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
```

`src/components/layout/AccountMenu.tsx` (logout moved from `DashboardPage.tsx:336-347`):

```tsx
import { ChevronsUpDown, LogOut, Moon, Sun } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SidebarMenuButton } from "@/components/ui/sidebar";
import { useDarkMode } from "@/hooks/useDarkMode";
import { API_URL } from "@/lib/api";
import { useAuthStore } from "@/lib/state/auth";

export function AccountMenu() {
  const { user } = useAuthStore();
  const { isDark, toggleDarkMode } = useDarkMode();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const response = await fetch(`${API_URL}/logout`, { credentials: "include" });
      if (response.ok) navigate("/", { replace: true });
      else toast.error("Couldn't log out. Try again.");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "An unknown error occurred.");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton size="lg" tooltip="Account">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user?.image ?? ""} alt="" />
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {user?.name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="grid min-w-0 text-left leading-tight">
            <span className="truncate text-sm font-medium">{user?.name}</span>
            <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
          </div>
          <ChevronsUpDown className="ml-auto h-4 w-4 text-muted-foreground" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-56">
        <DropdownMenuItem
          onSelect={(e) => {
            // Keep the menu open so the change is visible.
            e.preventDefault();
            toggleDarkMode();
          }}
        >
          {isDark ? <Sun className="h-4 w-4 mr-2" /> : <Moon className="h-4 w-4 mr-2" />}
          {isDark ? "Light mode" : "Dark mode"}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={handleLogout}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="h-4 w-4 mr-2" /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

`src/components/layout/AppSidebar.tsx`:

```tsx
import { useEffect } from "react";
import { NavLink, useLocation, useMatch, useNavigate } from "react-router-dom";
import { Settings } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { dashboardPath } from "@/lib/dashboard-params";
import { DASHBOARD_PAGES } from "@/lib/dashboard-pages";
import type { Tenant } from "@/lib/types/dashboard.types";
import { AccountMenu } from "./AccountMenu";
import { SiteSwitcher } from "./SiteSwitcher";

interface AppSidebarProps {
  tenants: Tenant[];
  activeSiteId: string | null;
}

export function AppSidebar({ tenants, activeSiteId }: AppSidebarProps) {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const statsMatch = useMatch("/dashboard/:siteId/:page");
  const onSitesPage = useMatch("/sites") !== null;
  const { setOpenMobile } = useSidebar();

  // On mobile the sidebar is a sheet; close it once a link has navigated.
  useEffect(() => setOpenMobile(false), [pathname, setOpenMobile]);

  const currentPage = statsMatch?.params.page ?? "overview";
  // Only stats pages carry range and filters in their URL.
  const carriedSearch = statsMatch ? search : "";
  const activeSite = tenants.find((t) => t.id === activeSiteId);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SiteSwitcher
          tenants={tenants}
          activeSite={activeSite}
          onSelect={(id) => navigate(dashboardPath(id, currentPage, carriedSearch))}
        />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Analytics</SidebarGroupLabel>
          <SidebarMenu>
            {DASHBOARD_PAGES.map(({ slug, title, icon: Icon }) => (
              <SidebarMenuItem key={slug}>
                <SidebarMenuButton
                  asChild
                  isActive={statsMatch?.params.page === slug}
                  tooltip={title}
                >
                  <NavLink
                    to={activeSiteId ? dashboardPath(activeSiteId, slug, carriedSearch) : "/sites"}
                  >
                    <Icon />
                    <span>{title}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={onSitesPage} tooltip="Sites">
              <NavLink to="/sites">
                <Settings />
                <span>Sites</span>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <AccountMenu />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
```

`src/components/layout/AppLayout.tsx`:

```tsx
import { useRef } from "react";
import { Outlet, useMatch } from "react-router-dom";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useTenants } from "@/hooks/useTenants";
import { AppSidebar } from "./AppSidebar";

export function AppLayout() {
  const { data } = useTenants();
  // useParams in a parent route can't see a child's :siteId, so match it.
  const match = useMatch("/dashboard/:siteId/*");
  // This layout stays mounted between stats pages and /sites, so the ref
  // remembers which site the sidebar links should point at on /sites.
  const lastSiteId = useRef<string | null>(null);
  if (match?.params.siteId) lastSiteId.current = match.params.siteId;
  const activeSiteId = lastSiteId.current ?? data?.tenants[0]?.id ?? null;

  return (
    <SidebarProvider>
      <AppSidebar tenants={data?.tenants ?? []} activeSiteId={activeSiteId} />
      <SidebarInset>
        <Outlet />
      </SidebarInset>
    </SidebarProvider>
  );
}
```

`src/components/layout/DashboardIndexRedirect.tsx`:

```tsx
import { Navigate, useSearchParams } from "react-router-dom";
import { useTenants } from "@/hooks/useTenants";
import { dashboardPath, legacyDashboardTarget } from "@/lib/dashboard-params";

// /dashboard has no page of its own. Old ?tenant= links go to that site;
// otherwise the first site, or /sites for an account with none.
export function DashboardIndexRedirect() {
  const [searchParams] = useSearchParams();
  const { data, isError } = useTenants();
  const legacy = legacyDashboardTarget(searchParams);

  if (legacy.siteId) {
    return <Navigate to={dashboardPath(legacy.siteId, "overview", legacy.search)} replace />;
  }
  if (isError) {
    return (
      <p className="p-8 text-sm text-muted-foreground">
        Couldn't load your sites. Refresh to try again.
      </p>
    );
  }
  if (!data) return null;

  const first = data.tenants[0];
  if (!first) return <Navigate to="/sites" replace />;
  return <Navigate to={dashboardPath(first.id, "overview", legacy.search)} replace />;
}
```

- [ ] **Step 6: Create the Overview page**

`src/pages/dashboard/OverviewPage.tsx`:

```tsx
import { BarChart3, Eye, FileText, Link2, Timer, Users } from "lucide-react";
import AnalyticsChart from "@/components/AnalyticsChart";
import { InsightCards } from "@/components/dashboard/InsightCards";
import { StatCard } from "@/components/dashboard/StatCard";
import { TableCard } from "@/components/dashboard/TableCard";
import { useDashboardParams } from "@/hooks/useDashboardParams";
import { useStat } from "@/hooks/useStat";
import { dashboardPath } from "@/lib/dashboard-params";
import type {
  CompareResponse,
  InsightsResponse,
  PagesResponse,
  ReferrersResponse,
  SessionsResponse,
  StatsSummary,
  ViewsOverTimeResponse,
} from "@/lib/types/dashboard.types";

export default function OverviewPage() {
  const { siteId, searchParams } = useDashboardParams();
  const summary = useStat<StatsSummary>("summary");
  const compare = useStat<CompareResponse>("compare");
  const sessions = useStat<SessionsResponse>("sessions");
  const views = useStat<ViewsOverTimeResponse>("views-over-time");
  const insights = useStat<InsightsResponse>("insights");
  const pages = useStat<PagesResponse>("pages");
  const referrers = useStat<ReferrersResponse>("referrers");
  const search = searchParams.toString();

  return (
    <>
      <InsightCards data={insights.data} />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Unique Visitors"
          value={summary.data?.uniqueVisitors ?? 0}
          icon={Users}
          change={compare.data?.uniqueVisitors?.change}
          isLoading={summary.isLoading}
          tooltip="Number of individual people who visited your site. Each person is counted only once, no matter how many pages they viewed."
        />
        <StatCard
          title="Page Views"
          value={summary.data?.pageViews ?? 0}
          icon={Eye}
          change={compare.data?.pageViews?.change}
          isLoading={summary.isLoading}
          tooltip="Total number of pages viewed. If one person views the same page 3 times, that counts as 3 page views."
        />
        <StatCard
          title="Bounce Rate"
          value={summary.data?.bounceRate != null ? `${summary.data.bounceRate}%` : "—"}
          icon={BarChart3}
          isLoading={summary.isLoading}
          tooltip="Percentage of visitors who left after viewing only one page, without clicking anything else. Lower is generally better."
        />
        <StatCard
          title="Avg Session"
          value={sessions.data?.avgDurationFormatted ?? "—"}
          icon={Timer}
          isLoading={!sessions.data}
          tooltip="How long, on average, people spend on your site per visit. Longer usually means they find your content useful."
        />
      </div>

      {views.data?.views && (
        <AnalyticsChart
          data={views.data.views}
          title="Views Over Time"
          tooltip="Shows how many page views your site received over the selected time period. The line goes up when traffic increases and down when it decreases."
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TableCard
          title="Top Pages"
          icon={FileText}
          data={pages.data?.pages ?? []}
          labelKey="path"
          valueKey="views"
          valueLabel="Views"
          limit={5}
          moreHref={dashboardPath(siteId, "content", search)}
        />
        <TableCard
          title="Top Referrers"
          icon={Link2}
          data={referrers.data?.referrers ?? []}
          labelKey="referrer"
          valueKey="views"
          valueLabel="Views"
          limit={5}
          moreHref={dashboardPath(siteId, "sources", search)}
        />
      </div>
    </>
  );
}
```

- [ ] **Step 7: Wire the routes in `App.tsx`**

Replace the `DashboardPage` and `SettingsPage` imports with:

```tsx
import { useLocation } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { StatsLayout } from "./components/layout/StatsLayout";
import { DashboardIndexRedirect } from "./components/layout/DashboardIndexRedirect";
import OverviewPage from "./pages/dashboard/OverviewPage";
import SettingsPage from "./components/SettingsPage";
```

(Merge `useLocation` into the existing `react-router-dom` import. `SettingsPage` moves in Task 6.)

Add above `const router`:

```tsx
// /dashboard/:siteId on its own opens Overview, keeping range and filters.
const ToOverview: React.FC = () => {
  const { search } = useLocation();
  return <Navigate to={{ pathname: "overview", search }} replace />;
};
```

Replace the `ProtectedRoute` children with:

```tsx
children: [
  { path: "/dashboard", element: <DashboardIndexRedirect /> },
  {
    element: <AppLayout />,
    children: [
      {
        path: "/dashboard/:siteId",
        element: <StatsLayout />,
        children: [
          { index: true, element: <ToOverview /> },
          { path: "overview", element: <OverviewPage /> },
        ],
      },
      { path: "/settings", element: <SettingsPage /> },
    ],
  },
],
```

`/settings` sits inside `AppLayout` for now, so the sidebar shows there. Task 6 renames it to `/sites`. Until then, the sidebar's Sites link and the Add site and Add domain buttons point at `/sites`, which falls through to the `*` route. That's acceptable mid-plan because Tasks 4 to 6 ship together. Don't deploy between them.

`DashboardPage.tsx` is now unreachable but still compiles. Task 5 deletes it.

- [ ] **Step 8: Typecheck**

Run: `npx tsc -b`
Expected: no errors.

- [ ] **Step 9: Check in the browser**

Run: `npm run dev` with the API up. Check each of these:

1. `/dashboard` lands on `/dashboard/<first site>/overview`.
2. Overview shows insights, 4 KPIs, the chart and two top-5 tables. "View all" links go to `/content` and `/sources`. Those 404 to `/` until Task 5, which is expected.
3. Period buttons, Custom and filters update the URL. Refresh keeps them.
4. `/dashboard?tenant=<id>&period=7d` lands on `/dashboard/<id>/overview?period=7d`.
5. `/dashboard/doesnotexist/overview` lands on your first site's overview.
6. The sidebar collapses to icons with the trigger. At phone width it opens as a sheet, and tapping Overview closes it.
7. The account menu toggles the theme and logs out.
8. A site with no domains shows the setup warning.
9. An account with no sites: in a dev database with all sites deleted, `/dashboard` lands on `/sites`. Skip this if you have no such account handy; Task 6 makes `/sites` real, and it gets checked again in Task 7.

- [ ] **Step 10: Run the gate and commit (after Atharv says to commit)**

Run: `npm run lint && npx tsc -b && npm test`

```bash
git add dashboard/src/App.tsx dashboard/src/lib/api.ts dashboard/src/lib/dashboard-pages.ts dashboard/src/hooks dashboard/src/components/layout dashboard/src/pages/dashboard/OverviewPage.tsx
git commit -m "feat(dashboard): add sidebar shell and overview page" -m "Stats pages now live at /dashboard/:siteId/<page> inside a sidebar layout. The site comes from the path and range and filters from the query string, with no state copies to keep in sync. Old ?tenant= links redirect to the new paths."
```

---

### Task 5: The other five pages, and delete the old dashboard

**Files:**
- Create: `src/pages/dashboard/{ContentPage,SourcesPage,AudiencePage,ConversionsPage,PerformancePage}.tsx`
- Modify: `src/App.tsx`
- Delete: `src/pages/DashboardPage.tsx`, `src/components/dashboard/DashboardHeader.tsx`, `src/components/dashboard/GoalsSection.tsx`, `src/components/dashboard/PagesReferrersSection.tsx`

**Interfaces:**
- Consumes: `useStat`, `useDashboardParams` (Task 4), `TableCard`, `toOutboundRows` (Task 3); existing `StatCard`, `CampaignsSection({ data })`, `LocationSection({ data })`, `TechSection({ browsers, os, languages, devices })`, `FunnelSection({ tenantId, range })`, `CohortSection({ queryParams, enabled })`, `PerformanceSection({ data })`.
- Produces: default-export page components for the routes below.

- [ ] **Step 1: Content page**

`src/pages/dashboard/ContentPage.tsx`:

```tsx
import { ExternalLink, FileText, Scroll, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { TableCard } from "@/components/dashboard/TableCard";
import { useStat } from "@/hooks/useStat";
import { toOutboundRows } from "@/lib/utils";
import type {
  EngagementResponse,
  OutboundResponse,
  PagesResponse,
  ScrollDepthResponse,
} from "@/lib/types/dashboard.types";

export default function ContentPage() {
  const pages = useStat<PagesResponse>("pages");
  const engagement = useStat<EngagementResponse>("engagement");
  const scroll = useStat<ScrollDepthResponse>("scroll-depth");
  const outbound = useStat<OutboundResponse>("outbound");

  const dist = scroll.data?.distribution;
  const scrollRows = dist
    ? [
        { depth: "25%", visits: dist.at25 },
        { depth: "50%", visits: dist.at50 },
        { depth: "75%", visits: dist.at75 },
        { depth: "100%", visits: dist.at100 },
      ]
    : [];

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <StatCard
          title="Pages / Session"
          value={engagement.data?.avgPagesPerSession ?? "—"}
          icon={TrendingUp}
          isLoading={!engagement.data}
          tooltip="Average number of pages a person looks at during a single visit. Higher usually means your content is engaging."
        />
        <StatCard
          title="Avg Scroll"
          value={scroll.data?.avgScrollDepth ? `${scroll.data.avgScrollDepth}%` : "—"}
          icon={Scroll}
          isLoading={!scroll.data}
          tooltip="How far down the page people typically scroll. 100% means they reached the bottom."
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <TableCard
          className="lg:col-span-2"
          title="Top Pages"
          icon={FileText}
          data={pages.data?.pages ?? []}
          labelKey="path"
          valueKey="views"
          valueLabel="Views"
        />
        <TableCard
          title="Scroll Depth"
          icon={Scroll}
          data={scrollRows}
          labelKey="depth"
          valueKey="visits"
          valueLabel="Visits"
        />
      </div>

      <TableCard
        title="Outbound Links"
        icon={ExternalLink}
        data={toOutboundRows(outbound.data)}
        labelKey="url"
        valueKey="clicks"
        valueLabel="Clicks"
      />
    </>
  );
}
```

- [ ] **Step 2: Sources page**

`src/pages/dashboard/SourcesPage.tsx`:

```tsx
import { Link2, Megaphone } from "lucide-react";
import { CampaignsSection } from "@/components/dashboard/CampaignsSection";
import { TableCard } from "@/components/dashboard/TableCard";
import { useStat } from "@/hooks/useStat";
import type {
  CampaignsResponse,
  ReferrersResponse,
  UtmSourcesResponse,
} from "@/lib/types/dashboard.types";

export default function SourcesPage() {
  const referrers = useStat<ReferrersResponse>("referrers");
  const sources = useStat<UtmSourcesResponse>("sources");
  const campaigns = useStat<CampaignsResponse>("campaigns");

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <TableCard
          title="Top Referrers"
          icon={Link2}
          data={referrers.data?.referrers ?? []}
          labelKey="referrer"
          valueKey="views"
          valueLabel="Views"
        />
        <TableCard
          title="UTM Sources"
          icon={Megaphone}
          data={sources.data?.sources ?? []}
          labelKey="source"
          valueKey="views"
          valueLabel="Views"
        />
      </div>
      <CampaignsSection data={campaigns.data} />
    </>
  );
}
```

- [ ] **Step 3: Audience page**

`src/pages/dashboard/AudiencePage.tsx`:

```tsx
import { MapPin } from "lucide-react";
import { LocationSection } from "@/components/dashboard/LocationSection";
import { TableCard } from "@/components/dashboard/TableCard";
import { TechSection } from "@/components/dashboard/TechSection";
import { useStat } from "@/hooks/useStat";
import type {
  BrowsersResponse,
  CitiesResponse,
  DevicesResponse,
  LanguagesResponse,
  LocationsResponse,
  OsResponse,
} from "@/lib/types/dashboard.types";

export default function AudiencePage() {
  const locations = useStat<LocationsResponse>("locations");
  const cities = useStat<CitiesResponse>("cities");
  const devices = useStat<DevicesResponse>("devices");
  const browsers = useStat<BrowsersResponse>("browsers");
  const os = useStat<OsResponse>("os");
  const languages = useStat<LanguagesResponse>("languages");

  return (
    <>
      <LocationSection data={locations.data} />
      <TableCard
        title="Top Cities"
        icon={MapPin}
        data={cities.data?.cities ?? []}
        labelKey="city"
        valueKey="views"
        valueLabel="Views"
      />
      <TechSection
        browsers={browsers.data}
        os={os.data}
        languages={languages.data}
        devices={devices.data}
      />
    </>
  );
}
```

- [ ] **Step 4: Conversions page**

`src/pages/dashboard/ConversionsPage.tsx`:

```tsx
import { Target } from "lucide-react";
import { CohortSection } from "@/components/dashboard/CohortSection";
import { FunnelSection } from "@/components/dashboard/FunnelSection";
import { TableCard } from "@/components/dashboard/TableCard";
import { useDashboardParams } from "@/hooks/useDashboardParams";
import { useStat } from "@/hooks/useStat";
import type { GoalsResponse } from "@/lib/types/dashboard.types";

export default function ConversionsPage() {
  const { siteId, range, statsQuery } = useDashboardParams();
  const goals = useStat<GoalsResponse>("goals");

  return (
    <>
      <TableCard
        title="Top Goals"
        icon={Target}
        data={goals.data?.goals ?? []}
        labelKey="name"
        valueKey="completions"
        valueLabel="Count"
      />
      {/* Keyed by site so switching sites clears the previous funnel. */}
      <FunnelSection key={siteId} tenantId={siteId} range={range} />
      <CohortSection queryParams={statsQuery} enabled={siteId !== ""} />
    </>
  );
}
```

- [ ] **Step 5: Performance page**

`src/pages/dashboard/PerformancePage.tsx`:

```tsx
import { PerformanceSection } from "@/components/dashboard/PerformanceSection";
import { useStat } from "@/hooks/useStat";
import type { PerformanceResponse } from "@/lib/types/dashboard.types";

export default function PerformancePage() {
  const perf = useStat<PerformanceResponse>("performance");
  return <PerformanceSection data={perf.data} />;
}
```

- [ ] **Step 6: Add the routes**

In `App.tsx`, import the five pages:

```tsx
import ContentPage from "./pages/dashboard/ContentPage";
import SourcesPage from "./pages/dashboard/SourcesPage";
import AudiencePage from "./pages/dashboard/AudiencePage";
import ConversionsPage from "./pages/dashboard/ConversionsPage";
import PerformancePage from "./pages/dashboard/PerformancePage";
```

and add them next to `overview` under `/dashboard/:siteId`:

```tsx
{ path: "content", element: <ContentPage /> },
{ path: "sources", element: <SourcesPage /> },
{ path: "audience", element: <AudiencePage /> },
{ path: "conversions", element: <ConversionsPage /> },
{ path: "performance", element: <PerformancePage /> },
```

- [ ] **Step 7: Delete the old dashboard**

Run:

```bash
git rm src/pages/DashboardPage.tsx src/components/dashboard/DashboardHeader.tsx src/components/dashboard/GoalsSection.tsx src/components/dashboard/PagesReferrersSection.tsx
```

Then run `npx tsc -b`.
Expected: no errors. If anything still imports a deleted file, it's a leftover from Task 3 or 4: switch it to `TableCard` or the new layout.

- [ ] **Step 8: Check in the browser**

1. Each of the six sidebar links loads its page, and the Network tab shows only that page's `/api/stats/*` requests: Content 4, Sources 3, Audience 6, Conversions 2 (funnels run on demand), Performance 1.
2. Set `7d` plus a browser filter on Content, then click Sources. The URL and data keep `7d` and the filter.
3. Switch site from the sidebar while on Audience. You stay on Audience with the same range.
4. Back and forward step through page and site changes, not filter changes.
5. Run a funnel on Conversions, switch site, come back. The funnel is cleared.

- [ ] **Step 9: Run the gate and commit (after Atharv says to commit)**

Run: `npm run lint && npx tsc -b && npm test`

```bash
git add dashboard/src/App.tsx dashboard/src/pages/dashboard
git commit -m "feat(dashboard): split stats into content, sources, audience, conversions and performance pages" -m "Each page fetches only its own data instead of all 22 requests at once. Removes the old single-page dashboard, its header and the two bundled table sections."
```

(`git rm` already staged the deletions.)

---

### Task 6: Move Settings to /sites inside the layout

**Files:**
- Move: `src/components/SettingsPage.tsx` to `src/pages/SitesPage.tsx`
- Modify: `src/pages/SitesPage.tsx`, `src/App.tsx`

**Interfaces:**
- Consumes: `PageHeader` (Task 4), existing `ShareLinksDialog({ tenantId })`.
- Produces: default export `SitesPage`.

- [ ] **Step 1: Move the file**

Run: `git mv src/components/SettingsPage.tsx src/pages/SitesPage.tsx`

- [ ] **Step 2: Rename the component and swap its page chrome for `PageHeader`**

In `src/pages/SitesPage.tsx`:

- Rename `const SettingsPage = () =>` to `const SitesPage = () =>` and the last line to `export default SitesPage;`.
- Remove the imports of `DarkModeToggle` and `Link`.
- Add:

```tsx
import { PageHeader } from "@/components/layout/PageHeader";
import { ShareLinksDialog } from "@/components/dashboard/ShareLinksDialog";
```

- Replace the outer wrapper, SEO and back-button row (`SettingsPage.tsx:180-191`):

```tsx
<div className="p-4 md:p-8 bg-background min-h-screen">
  <SEO ... />
  <div className="flex items-center justify-between mb-8">
    ...Back to Dashboard... <DarkModeToggle />
  </div>
```

with:

```tsx
<>
  <SEO
    title="Sites"
    description="Configure your tracked domains, view tracking snippet integration scripts, and manage site parameters."
    noindex={true}
  />
  <PageHeader title="Sites" />
  <div className="p-4 md:p-6">
```

and close it at the end with `</div></>` in place of the final `</div>`.

- In each site card's action row (`SettingsPage.tsx:352`), change `<div className="flex justify-end">` to `<div className="flex justify-end gap-2">` and add `<ShareLinksDialog tenantId={tenant.id} />` before the Delete Site `<Dialog>`.

- [ ] **Step 3: Routes**

In `App.tsx`, replace `import SettingsPage from "./components/SettingsPage";` with `import SitesPage from "./pages/SitesPage";` and replace `{ path: "/settings", element: <SettingsPage /> }` with:

```tsx
{ path: "/sites", element: <SitesPage /> },
```

Then add, as a sibling of the `AppLayout` entry inside `ProtectedRoute`'s children:

```tsx
{ path: "/settings", element: <Navigate to="/sites" replace /> },
```

- [ ] **Step 4: Check in the browser**

1. `/settings` lands on `/sites`.
2. `/sites` shows the sidebar. The page links point at the last site you viewed, and Sites is highlighted.
3. Create, rename, add and remove domains, copy script and delete all still work. Error toasts still show on failure; stop the API to test one.
4. Each site card has the share links button. It lists and deletes that site's links.
5. "Add site" in the switcher and "Add domain" in the setup warning both open `/sites`.

- [ ] **Step 5: Run the gate and commit (after Atharv says to commit)**

Run: `npm run lint && npx tsc -b && npm test`

```bash
git add dashboard/src/App.tsx dashboard/src/pages/SitesPage.tsx
git commit -m "feat(dashboard): move site settings to /sites inside the sidebar layout" -m "Site management now shares the sidebar with the stats pages. Managing share links moves onto each site's card, since it's site admin rather than a stats action. /settings redirects to /sites."
```

(`git mv` already staged the rename.)

---

### Task 7: Final check

**Files:** none changed unless a check fails.

- [ ] **Step 1: Run every gate**

From `dashboard/`: `npm run lint && npx tsc -b && npm test && npm run build`
From the repo root: `npx tsc --noEmit && npx vitest run`
Expected: all pass. The root has no lint script.

- [ ] **Step 2: Walk the spec's manual checklist**

From `docs/superpowers/specs/2026-10-01-dashboard-shell-design.md`, Testing section:

- each of the six pages loads its data
- period, custom range and filters persist across page switches and refresh
- back and forward step through page and site changes; filter and period changes replace the entry
- site switch keeps page and range
- mobile drawer opens and closes
- `/dashboard?tenant=X&period=7d` and `/settings` redirect correctly
- `/shared/:token` looks the same as before
- an account with no sites lands on `/sites` from `/dashboard`

- [ ] **Step 3: Report**

Tell Atharv what passed, what failed and anything that changed from this plan. No commit in this task unless a fix was needed; a fix gets its own `fix(dashboard): ...` commit after he says to commit.
