# Dashboard shell: sidebar and focused pages

Date: 2026-10-01
Status: approved in chat, awaiting spec review

## Goal

Replace the single 560-line `/dashboard` page with an app shell: a sidebar, a slim top bar, and six pages that each answer one question and fetch only their own data.

This is a structure project. The current visual style (type, color, card look) stays. A visual pass comes later as its own project.

## Decisions

| Question | Decision |
| --- | --- |
| Scope | Structure first, visuals later |
| Page split | Six pages: Overview, Content, Sources, Audience, Conversions, Performance |
| Share view (`/shared/:token`) | Stays one read-only page; only its imports change |
| State | The URL is the only source of truth |
| Sidebar | shadcn `sidebar` component |
| Tests | Add `vitest` to `dashboard/` as a dev dependency; unit-test pure URL logic |

## Routes

```
/dashboard                      redirect to first site's /overview
/dashboard/:siteId              redirect to /overview
/dashboard/:siteId/overview
/dashboard/:siteId/content
/dashboard/:siteId/sources
/dashboard/:siteId/audience
/dashboard/:siteId/conversions
/dashboard/:siteId/performance
/sites                          site management (today's /settings)
/settings                       redirect to /sites
/shared/:token                  unchanged
```

All `/dashboard/*` routes and `/sites` render inside `DashboardLayout`, which sits inside the existing `ProtectedRoute`.

### Legacy links

- `/dashboard?tenant=X&<rest>` redirects to `/dashboard/X/overview?<rest>`, dropping `tenant` and keeping every other param.
- `/dashboard` with no `tenant` redirects to the first site's overview, keeping the query string.
- A user with no sites lands on `/sites`.
- An unknown `:siteId` (deleted site, or one the user can't access) redirects to `/dashboard`.

## State

`siteId` comes from the path. Everything else lives in the query string:

- `period`: `24h | 7d | 30d | 90d`, default `24h`
- `startDate`, `endDate`: `YYYY-MM-DD`. Both present means a custom range and `period` is ignored.
- `browser`, `os`, `country`, `language`, `device`: segment filters

### `useDashboardParams()`

Reads the URL and returns:

```ts
interface DashboardParams {
  siteId: string;
  range: DateRange; // { period } or { startDate, endDate } as ISO datetimes
  customRange: boolean;
  segments: Segments;
  setPeriod: (period: Period) => void;      // clears startDate/endDate
  setCustomRange: (start: string, end: string) => void;
  clearCustomRange: () => void;
  setSegment: (key: keyof Segments, value: string) => void;
  clearSegments: () => void;
}
```

Setters write to the URL with `replace: true`. No `useState` copies and no sync effect.

The parsing and serializing live in plain functions (`parseDashboardSearch`, `toStatsQuery`) so they can be tested without React.

### `useStat<T>(name)`

Wraps `useQuery` for one `/api/stats/<name>` endpoint:

- builds the query from `siteId`, `range`, `segments` and the viewer's `tz`
- query key: `["stats", siteId, range, segments, name]`
- `enabled` only when `siteId` is set

Pages call it only for the data they show. The filter dropdown options keep today's approach: same keys with empty segments, fetched only while the filters row is open.

## Layout

```
┌──────────────┬──────────────────────────────────────────────────┐
│ site ▾       │ ☰  Page title   Updating…   period Custom        │
│──────────────│                             Filters Share Export │
│ Overview     │──────────────────────────────────────────────────│
│ Content      │  filters row (when open)                         │
│ Sources      │  setup warning (when the site has no domains)    │
│ Audience     │                                                  │
│ Conversions  │  <Outlet />                                      │
│ Performance  │                                                  │
│──────────────│                                                  │
│ Sites        │                                                  │
│ account ▾    │                                                  │
└──────────────┴──────────────────────────────────────────────────┘
```

### Sidebar

shadcn `Sidebar` with `collapsible="icon"`. It becomes a sheet below the mobile breakpoint.

- **Header:** site switcher. Lists sites, plus "Add site", which links to `/sites`. Switching keeps the current page and query string.
- **Main group:** the six pages as `NavLink`s that carry the current query string. The active page is highlighted.
- **Footer:** Sites link, then an account menu with name, email, theme toggle and Log out.

On `/sites` the switcher and page links point at the last viewed site.

### Top bar (`DashboardTopBar`)

One component shared by all six pages.

- **Left:** `SidebarTrigger`, page title, "Updating…" while any `["stats"]` query fetches.
- **Right:** period control with Custom, Filters toggle, Share (existing `ShareButton`), Export (CSV/JSON).

Removed from the bar: site picker (now in the sidebar), theme and avatar (sidebar footer), Manage share links (moved to `/sites`).

`FiltersBar` renders below the top bar, unchanged.

### Setup warning

The "Finish setting up X, add a domain" banner moves from Overview into the layout, so it shows on every page for a site with no domains.

## Pages

| Page | Contents | Endpoints |
| --- | --- | --- |
| Overview | Insights; KPIs: Visitors, Page views, Bounce rate, Avg session, with % change; Views over time; top 5 pages and top 5 referrers, each linking to its page | insights, summary, compare, sessions, views-over-time, pages, referrers |
| Content | Top pages, Pages/session, scroll depth (average and 25/50/75/100 distribution), outbound links | pages, engagement, scroll-depth, outbound |
| Sources | Referrers, UTM sources, campaigns | referrers, sources, campaigns |
| Audience | Map and countries, cities, devices, browsers, OS, languages | locations, cities, devices, browsers, os, languages |
| Conversions | Top goals, funnel, cohorts | goals, funnels (on demand), cohorts |
| Performance | Web vitals | performance |

Dropped cards: Sessions (raw count beside Visitors) and Scroll (100%) (now part of the Content scroll distribution).

## Component changes

- Split `GoalsSection` into `GoalsCard`, `UtmSourcesCard`, `CitiesCard` and `OutboundCard`.
- Split `PagesReferrersSection` into `TopPagesCard` and `ReferrersCard`, with an optional row limit for the Overview previews.
- Update `SharedDashboardPage` to place the new cards in the same arrangement it shows today.
- Move `ShareLinksDialog` onto each site's card on `/sites`.
- `SettingsPage` moves to `pages/SitesPage.tsx` and drops its own page chrome, since the layout now provides it.

## Deleted

- `pages/DashboardPage.tsx`
- `components/dashboard/DashboardHeader.tsx`
- `components/dashboard/GoalsSection.tsx`, `components/dashboard/PagesReferrersSection.tsx` (after the split)
- The page-level `TooltipProvider`; `App.tsx` already provides one.

## New dependencies

- `radix-ui` (runtime): required by the shadcn sidebar. It overlaps with the existing `@radix-ui/react-*` packages. Moving the rest of `ui/` to `radix-ui` is a possible later cleanup, not part of this project.
- `vitest` (dev).

The shadcn CLI also adds `ui/sidebar.tsx`, `ui/sheet.tsx`, `ui/separator.tsx`, `ui/skeleton.tsx`, `hooks/use-mobile.ts` and `--sidebar-*` variables in `index.css`. Its prompts to overwrite the existing `button`, `tooltip` and `input` get declined; `sidebar.tsx` must compile against the local versions.

The sidebar stores its open state in a `sidebar_state` cookie on the dashboard origin. Tracked sites are not affected.

## Error handling

- Stats requests keep today's behavior: `fetchAPI` throws on non-OK, sections render their empty state, and `keepPreviousData` keeps the last result on screen while a new range loads.
- Logout failure keeps its toast.
- Unknown `:siteId` redirects as described under Legacy links.

## Testing

Unit tests with vitest in `dashboard/`, no DOM:

- `parseDashboardSearch`: defaults, preset period, custom range wins over period, invalid `period` and `device` values fall back
- `toStatsQuery`: includes `tz`, range and only set segments
- legacy redirect mapping: `tenant` moves to the path, other params survive
- nav link `to` builder: keeps the query string when switching page or site

Manual check in the browser:

- each of the six pages loads its data
- period, custom range and filters persist across page switches and refresh
- browser back and forward step through page and site changes; filter and period changes replace the entry, as they do today
- site switch keeps page and range
- mobile drawer opens and closes
- `/dashboard?tenant=X&period=7d` and `/settings` redirect correctly
- `/shared/:token` looks the same as before

The pre-commit gate (lint, typecheck, tests) runs in both the root and `dashboard/`.

## Out of scope

- Visual redesign
- Share view restructure
- Migrating `ui/` components to the `radix-ui` package
- Any API changes
