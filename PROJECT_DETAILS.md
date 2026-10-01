# Telemetry: Project Details and Changelog

## 1. Project Overview

**Telemetry** is a privacy-focused, open-source analytics platform. It's built for creators and developers who want to see how a site performs without collecting more about their visitors than the numbers require.

### Guiding Principles

- **Privacy is Paramount**: Telemetry is cookieless by design and does not track individuals across the web. What it stores per event is a hashed visitor ID, country and city, page and referrer, device and screen size, and UTM parameters. The raw IP is used to look up country and city, then discarded.
- **Clarity Over Clutter**: The dashboard provides simple, actionable metrics like page views, unique visitors, and bounce rates, presented in a clean and intuitive interface.
- **You Own Your Data**: Self-hosted, your website's data resides on your own infrastructure and you can query the Postgres tables directly.
- **Small Stack, Clear Code**: Fastify, React, and TypeScript, with no build-time magic between you and the query that answers your question.

## 2. Technology Stack

This section provides a more detailed look at the key libraries and frameworks used in the project.

### Backend

- **Framework**: [Fastify](https://fastify.io/) - A high-performance, low-overhead web framework for Node.js.
- **Database ORM**: [Prisma](https://www.prisma.io/) - A next-generation ORM for Node.js and TypeScript that provides a type-safe database client.
- **Validation**: [Zod](https://zod.dev/) - A TypeScript-first schema declaration and validation library used for validating API request bodies and environment variables.
- **Logging**: [pino-pretty](https://github.com/pinojs/pino-pretty) - A utility for formatting Pino logs in a human-readable way during development.

### Frontend (`dashboard` directory)

- **Framework**: [React](https://react.dev/) with [Vite](https://vitejs.dev/) - A modern, fast build tool and development server for React applications.
- **Language**: [TypeScript](https://www.typescriptlang.org/) - Provides static typing for JavaScript, enhancing code quality and maintainability.
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [shadcn/ui](https://ui.shadcn.com/) - A utility-first CSS framework and a collection of pre-built, accessible React components.
- **Server State Management**: [TanStack Query (React Query)](https://tanstack.com/query/latest) - A powerful library for fetching, caching, and synchronizing server state in React applications.
- **Client State Management**: [Zustand](https://github.com/pmndrs/zustand) - A small, fast, and scalable state-management solution for React.
- **Charting**: [Recharts](https://recharts.org/) - A composable charting library built on React components.
- **Mapping**: [React jVectorMap](https://github.com/kadoshms/react-jvectormap) - A library for creating interactive vector maps in React.

## 3. Functionality

### Tracking Script (`public/analytics.js`)

The core of the data collection is a lightweight JavaScript snippet that website owners embed on their pages.

- **How it works**:
  1. The script is loaded asynchronously to avoid blocking page rendering.
  2. It requires a `data-tenant-id` attribute in the `<script>` tag to associate the data with the correct site.
  3. It optionally reads a `data-api-key` attribute for authenticated event ingestion.
  4. On page load, it automatically captures a `pageview` event, collecting information like:
     - Hostname, path, and referrer
     - Screen dimensions
     - UTM parameters from the URL
  5. It uses `fetch` with `keepalive: true` and `credentials: "omit"` to send this data to the backend API (`/api/track`), so the request survives page unloads without sending cookies or delaying the next page.
  6. A global `window.telemetry.goal(goalName)` function is exposed, allowing website owners to track custom conversion events (e.g., newsletter sign-ups, button clicks).

### Authentication

User authentication is handled via GitHub OAuth2.

- **Login Flow**:
  1. A user clicks the "Sign in with GitHub" button on the `LoginPage`.
  2. They are redirected to `http://localhost:3000/login/github`, which initiates the GitHub OAuth flow.
  3. After authorizing the application, GitHub redirects the user back to `http://localhost:3000/login/github/callback`.
  4. The backend exchanges the authorization code for an access token.
  5. It then fetches the user's profile and primary verified email from the GitHub API.
  6. A `User` record is created in the database if one doesn't exist for that email. A default "tenant" (site) is also created for new users.
  7. A signed, `httpOnly` cookie (`userId`) is set in the user's browser to maintain the session.
  8. The user is redirected to the `/dashboard`.

### Dashboard (`dashboard/src/pages/DashboardPage.tsx`)

The main dashboard is a single-page interface for viewing all analytics data.

- **Features**:
  - **Site (Tenant) Selection**: Users can switch between different websites they've registered from a dropdown menu.
  - **Time Period Filter**: Data can be filtered to show metrics for the last 24 hours, 7 days, or 30 days.
  - **Period Comparison**: Summary cards show percentage change vs the previous period.
  - **Key Metrics**: At-a-glance cards for **Page Views**, **Unique Visitors**, and **Engagement** (pages/session, new vs returning).
  - **Visualizations**:
    - **Views Over Time**: A line chart showing page view trends.
    - **Locations**: A world map and a table showing the top countries by page views.
    - **Devices**: Mobile/tablet/desktop breakdown with progress bars.
  - **Data Tables**:
    - Top Pages
    - Top Referrers
    - Top UTM Sources
    - Top Cities
    - Top UTM Mediums
    - Top Campaigns
    - Top Goal Completions

### Settings (`dashboard/src/components/SettingsPage.tsx`)

The settings page allows users to manage their sites.

- **Features**:
  - **Create New Site**: Users can add a new website (tenant) to their account with optional allowed domains. A unique API key (`tlv_1_...`) is automatically generated for each new site.
  - **View Embed Script**: For each site, the page displays the unique `<script>` tag (including `data-api-key` when available) with a one-click copy button.
  - **Manage Domains**: Users can add or remove allowed domains for CORS. Only requests from registered domains are accepted.
  - **Delete Site**: Users can permanently delete a site and all its associated analytics data.

## 3. API Reference

The backend is a Fastify server. All API routes are defined in the `src/routes/` directory.

### `POST /api/track`

- **File**: `src/routes/track.ts`
- **Description**: The main endpoint for collecting analytics data from the `analytics.js` script.
- **Request Body**: A JSON object that can be a `pageview`, `goal`, `outbound`, `performance`, or `scroll` event.
  - **`pageview`**: `{ type: "pageview", tenantId, apiKey?, hostname, path, browser, os, language, sessionId, ... }`
  - **`goal`**: `{ type: "goal", tenantId, apiKey?, goalName, properties?, sessionId, ... }`
  - **`outbound`**: `{ type: "outbound", tenantId, apiKey?, url, domain, path, sessionId }`
  - **`performance`**: `{ type: "performance", tenantId, apiKey?, path, lcp, fid, cls, ttfb, fcp, sessionId }`
  - **`scroll`**: `{ type: "scroll", tenantId, apiKey?, path, scrollDepth, sessionId }`
- **Processing**:
  1. **Rate Limiting**: IP-based rate limit of 30 requests/minute. Returns `429` when exceeded.
  2. **Bot Detection**: Checks the `User-Agent` header against a list of ~40 known bot patterns (crawlers, scrapers, AI bots, monitoring tools). Returns `403` if matched.
  3. Validates the incoming event against `createEventSchema`.
  4. Verifies that the `tenantId` exists.
  5. **API Key Validation**: If the tenant has an `apiKey` set, the request must include a matching `apiKey` in the body. Returns `403` on mismatch.
  6. Anonymizes the user by creating a unique `visitorId` hash from their IP address, User-Agent, and a server-side salt. This ensures privacy as the raw IP is not stored with the event.
  7. Uses the `ip-api.com` service to perform a GeoIP lookup on the request IP to determine the country and city.
  8. Saves the event to the `Event` table in the database.
- **Response**: `201 Created` on success.

### Authentication Routes

- **File**: `src/routes/auth.ts`

- **`GET /login/github`**: Initiates the GitHub OAuth2 flow by redirecting the user to GitHub's authorization page.
- **`GET /login/github/callback`**: The callback URL after GitHub authorization. Handles user creation/login and sets the session cookie.
- **`GET /me`**: Returns the currently authenticated user's information based on the `userId` cookie. Used by the frontend to maintain session state.
- **`GET /logout`**: Clears the `userId` cookie, effectively logging the user out.

### Tenant Management Routes

- **File**: `src/routes/tenants.ts`
- **Authentication**: All routes are protected by the `authHook`, which verifies the `userId` cookie.

- **`GET /api/tenants`**: Returns a list of all tenants (sites) the authenticated user has access to.
- **`POST /api/tenants`**: Creates a new tenant for the authenticated user.
- **`PUT /api/tenants/:id`**: Renames a tenant. The user must be an 'ADMIN' of the tenant.
- **`DELETE /api/tenants/:id`**: Deletes a tenant and all associated data. The user must be an 'ADMIN'.

### Statistics Routes

- **File**: `src/routes/stats.ts`
- **Authentication**: All routes are protected by the `authHook`.
- **Query Parameters**: All routes require `tenantId` and accept `period` (`24h`, `7d`, `30d`, `90d`), or `startDate`/`endDate` (ISO strings) for custom date ranges. Segment filtering params: `browser`, `os`, `country`, `language`, `device`, `referrer`, `utmSource`.

- **`POST /api/track`**: The main endpoint for collecting analytics data from the `analytics.js` script.
- **`GET /api/stats/summary`**: Returns the core metrics: `pageViews`, `uniqueVisitors`, and `bounceRate`.
- **`GET /api/stats/pages`**: Returns a list of the top 10 most viewed pages.
- **`GET /api/stats/referrers`**: Returns the top 10 referrers.
- **`GET /api/stats/views-over-time`**: Returns data points for the views-over-time line chart.
- **`GET /api/stats/sources`**: Returns the top 10 UTM sources.
- **`GET /api/stats/goals`**: Returns the top 10 completed goals.
- **`GET /api/stats/locations`**: Returns the top 20 countries by page views.
- **`GET /api/stats/devices`**: Returns mobile/tablet/desktop breakdown from screen width.
- **`GET /api/stats/engagement`**: Returns pages/session, new vs returning visitor split.
- **`GET /api/stats/campaigns`**: Returns top UTM mediums and campaigns.
- **`GET /api/stats/cities`**: Returns the top 20 cities by page views.
- **`GET /api/stats/compare`**: Compares current vs previous period with percentage change.
- **`GET /api/stats/browsers`**: Returns top browsers with view counts and percentages.
- **`GET /api/stats/os`**: Returns top operating systems with view counts and percentages.
- **`GET /api/stats/languages`**: Returns top languages with view counts and percentages.
- **`GET /api/stats/sessions`**: Returns total sessions and average session duration.
- **`GET /api/stats/scroll-depth`**: Returns average scroll depth and distribution (25%/50%/75%/100%).
- **`GET /api/stats/performance`**: Returns p50/p75/p90/p99 for LCP, INP, CLS, TTFB, FCP.
- **`GET /api/stats/outbound`**: Returns top 20 outbound links by click count.
- **`POST /api/stats/funnels`**: Accepts `{ tenantId, steps: ["/page1", "/page2", ...], period }` and returns conversion rates between steps.
- **`GET /api/stats/cohorts`**: Returns weekly cohort retention matrix.
- **`GET /api/stats/insights`**: Compares the selected period against the period of equal length immediately before it and returns cards for page views or visitors that moved more than 10%, a top-five page that grew more than 50%, or a referrer with more than 10 visits. Recomputed per request.
- **`GET /api/export/events`**: Exports events as CSV or JSON. Params: `tenantId`, `format` (csv/json), `startDate`, `endDate`, `limit`.

## 4. Database Schema

The schema is defined in `prisma/schema.prisma`.

- **`User`**: Stores user information (email, name, image).
- **`Account`**: Links a `User` to an OAuth provider (e.g., GitHub).
- **`Tenant`**: Represents a website being tracked. Includes an optional `apiKey` field for authenticated event ingestion.
- **`TenantUser`**: A join table linking `User` and `Tenant`, defining roles (e.g., 'ADMIN', 'MEMBER').
- **`Event`**: The central table for all analytics data. It stores pageviews, goals, outbound clicks, performance metrics, scroll depth, location data, browser/OS/language info, session tracking, UTM parameters, custom event properties, and the hashed `visitorId`.

## 5. Changelog

### 2026-10-01: `feat(alerts), per-tenant domain checks, stats corrections, and dev tooling`

- **Ingestion Alerts**: New `src/lib/ingestion-alert.ts`. When `ALERT_WEBHOOK_URL` is set, an hourly check posts to that webhook if a site's last 24h falls under 30% of its 7-day average. Sites below 20 events/day are skipped so normal swings don't read as outages. One alert per site per day, list capped at 15 to stay under Discord's 2000-character limit, and `allowed_mentions` is pinned empty so a site name can't ping `@everyone`. Unset variable disables it with a warning.
- **Per-Tenant Domain Checks**: `/api/track` now validates the request `Origin` against that tenant's `domains` list rather than relying on global CORS config. Domains are stored as bare origins, and requests with no `Origin` are treated as servers and authenticated by API key instead.
- **Simpler Event Requests**: Events are sent with `fetch` and `credentials: "omit"` instead of `sendBeacon`. A beacon always carries cookies, which turns the preflight into a credentialed one that `/api/track` refuses by design. `keepalive: true` preserves the ability to finish a request after the page unloads, so scroll-depth on `beforeunload` still lands.
- **Export Fixes**: `/api/export/events` accepts the dashboard's date range and segment filters, and writes ISO dates plus the `inp` column.
- **Site Deletion Cascade**: Deleting a tenant now deletes its events instead of leaving them orphaned.
- **Metrics Corrections**: Location stats count only pageviews, durations are rounded before aggregation, views-over-time is bucketed in the viewer's timezone rather than UTC, `avgPagesPerSession` is computed per session rather than per visitor, and funnel conversion enforces step order.
- **Vitest**: Added with a build config that excludes test files. Coverage for the visitor salt, track route, metrics, and alert logic.
- **Local Development**: Added `docker-compose.yml` for Postgres plus both services, and `prisma/seed.ts` for generating fake local traffic.
- **Dashboard**: UX audit fixes, and dark mode state is shared so toasts follow the theme.

### 2026-08-20: `fix: security hardening, quarterly visitor salt rotation, and stats correctness`

- **Quarterly Salt Rotation**: `visitorId` is now `sha256(ip + userAgent + tenantId + HMAC(VISITOR_SALT, quarter-label))`. The rotation bounds how long an ID stays stable for the same browser without breaking the 90-day period and 8-week cohort windows that rely on that continuity.
- **Proxy Trust**: `trustProxy` is set to `1` instead of `true`. One nginx hop sits in front of the process, so trusting only what nginx appended prevents a client from spoofing `request.ip` through a self-supplied `X-Forwarded-For` chain and bypassing the `/api/track` rate limiter.
- **CORS Credentials**: Scoped to the dashboard origin only.
- **Constant-Time Key Comparison**: Tenant API keys are compared with `timingSafeEqual`.
- **HTTPS Geolocation**: IP geolocation lookups moved to HTTPS.
- **CDN Integrity**: The `web-vitals` script tag is version-pinned and integrity-checked.
- **API Key on Signup**: Tenants created through GitHub sign-up now get an API key automatically.
- **Shared Metric Calculators**: Dashboard and share-link routes now read from the same calculators, so a shared view can't disagree with the live dashboard.

### 2026-06-30: `fix: remove AI slop design patterns and improve UI consistency`

- **Design Pass**: Removed filler styling from the dashboard and tightened spacing and color consistency.
- **Table Overflow**: `SimpleTable` scrolls when rows exceed `maxRows` instead of clipping them.

### 2026-06-28: `feat: share links, funnel and cohort UI, custom charts, and INP tracking`

- **Shareable Views**: New share-link routes let a dashboard view (including filters and period) be opened by someone without a session, with link management in the UI.
- **Funnel and Cohort UI**: Funnel analysis and cohort retention wired into the dashboard with explanatory tooltips, plus tooltips across the metrics cards.
- **INP**: Added an `inp` column to the `Event` table and replaced the hand-rolled performance observers with the `web-vitals` v3 library.
- **Chart Library**: Replaced the chart component with a custom animated set plus a shadcn registry config and chart CSS variables.
- **Share Auth Fix**: Resolved dashboard sharing auth and added a global `TooltipProvider`.
- **Bot Detection**: Consolidated the bot pattern regex and removed unused dependencies.

### 2026-06-25: `feat: bot protection, rate limiting, API key auth, and SQL injection fix`

- **Bot Detection**: The `/api/track` endpoint now filters ~40 known bot patterns (Googlebot, GPTBot, ClaudeBot, curl, scrapers, monitoring tools, etc.) and returns `403` for matches.
- **Rate Limiting**: IP-based rate limit of 30 requests/minute on `/api/track` only. Dashboard API endpoints are unaffected.
- **API Key Authentication**: New `apiKey` field on the `Tenant` model (nullable, unique). Auto-generated (`tlv_1_...` format, 256-bit entropy) on tenant creation. When set, `/api/track` validates the key from the request body. Legacy tenants without a key remain accessible.
- **Client Update**: `analytics.js` reads `data-api-key` from the script tag and includes it in all event payloads.
- **Dashboard Update**: Settings page now shows the full embed script (with `data-api-key`) and a one-click copy button.
- **SQL Injection Fix**: Replaced `prisma.$queryRawUnsafe()` with parameterized Prisma ORM queries in the `views-over-time` endpoint. All segment filter values are now properly escaped.
- **Dependency Swap**: Replaced incompatible `fastify-rate-limit` with `@fastify/rate-limit` for Fastify 5 compatibility.

### 2026-06-25: `feat: enhanced tracking, performance metrics, funnel analysis, and data export`

- **Enhanced Tracking Script**: `analytics.js` now captures browser/OS/version (client-side UA parsing), language, session ID (via sessionStorage), scroll depth (beforeunload beacon), outbound link clicks, and Core Web Vitals (LCP, INP, CLS, TTFB, FCP).
- **Custom Event Properties**: `window.telemetry.goal("name", { key: "value" })` now accepts an optional properties object stored as JSON.
- **New Event Types**: Added `outbound`, `performance`, and `scroll` event types alongside existing `pageview` and `goal`.
- **Database Schema**: Added 12 new columns to Event model (browser, browserVersion, os, osVersion, language, sessionId, scrollDepth, outboundUrl, outboundDomain, lcp, fid, cls, ttfb, fcp, properties) and 5 new indexes.
- **Custom Date Ranges**: All stats endpoints now accept `startDate`/`endDate` query params for arbitrary date ranges. Added `90d` period option.
- **Segment Filtering**: All stats endpoints support filtering by `browser`, `os`, `country`, `language`, `device` (mobile/tablet/desktop), `referrer`, and `utmSource`.
- **Browser/OS/Language Stats**: New endpoints `/api/stats/browsers`, `/api/stats/os`, `/api/stats/languages` with percentage breakdowns.
- **Session Analytics**: New endpoint `/api/stats/sessions` returning total sessions, average duration (formatted).
- **Scroll Depth Analytics**: New endpoint `/api/stats/scroll-depth` with average scroll depth and distribution (25%/50%/75%/100%).
- **Core Web Vitals**: New endpoint `/api/stats/performance` returning p50/p75/p90/p99 for LCP, INP, CLS, TTFB, FCP.
- **Outbound Link Tracking**: New endpoint `/api/stats/outbound` showing most-clicked external links.
- **Funnel Analysis**: New `POST /api/stats/funnels` endpoint accepting page path steps, returning conversion rates between each step.
- **Cohort/Retention Analysis**: New `GET /api/stats/cohorts` endpoint grouping visitors by first-visit week with weekly retention matrix.
- **Period-Over-Period Insights**: New `GET /api/stats/insights` endpoint that compares the selected period against the equal-length period before it and returns cards for page views or visitors moving more than 10%, a top-five page growing more than 50%, or a referrer with more than 10 visits. Fixed thresholds, recomputed per request.
- **Data Export**: New `GET /api/export/events` endpoint supporting CSV and JSON formats with date range filtering.
- **Dashboard UI**: Added custom date range picker, segment filter bar (browser/OS/country/language/device), period-comparison insight cards, session metrics, scroll depth cards, browser/OS/language tables, outbound links table, Core Web Vitals panel with color-coded p75 values, and data export button.

### 2026-06-23: `feat: advanced analytics, dynamic CORS, and UI overhaul`

- **Advanced Analytics Endpoints**: Added 5 new stats endpoints: devices, engagement, campaigns, cities, and period comparison.
- **Dashboard UI**: Added device breakdown bars, engagement card, city/medium/campaign tables, and period comparison badges on summary cards.
- **Dynamic CORS**: CORS origins are now managed per-tenant via a `domains` field in the database. Dashboard URL is always allowed via `FRONTEND_URL` env var.
- **Responsive Dashboard**: Fixed mobile overflow on dashboard header, added segmented period controls, responsive stat card sizing.
- **Mobile Navigation**: Added hamburger menu for mobile users on the landing page with dark mode toggle.
- **Global Dark Mode**: Dark mode now initializes on all pages, not just the landing page. Removed `next-themes` dependency in favor of custom `useDarkMode` hook.
- **Accurate Geolocation**: Replaced outdated `geoip-lite` with `ip-api.com` for city-level accuracy.
- **Trust Proxy**: Enabled `trustProxy` on Fastify to read real client IPs behind reverse proxies.
- **Build Script**: Added `prisma generate` and generated client copy to the build pipeline.
- **Tenant Domains**: Added `domains String[]` field to Tenant model for per-site CORS management.

### 2025-09-21: `feat: Overhaul UI with new landing and docs pages`

- **New Landing Page**: Replaced the previous landing page with a new, modern, and more informative home page that better showcases the project's features and guiding principles.
- **Documentation Section**: Added a comprehensive documentation section with detailed guides on architecture, authentication, tracking, and more.
- **Improved Logout**: The logout process now includes a confirmation dialog to prevent accidental sessions termination.
- **Enhanced Tracking**: The `analytics.js` script now exposes a `window.telemetry.pageview()` function for manual pageview tracking.
- **UI & Routing Fixes**: Updated application-wide routing to accommodate the new pages and improved the authentication error redirection logic.

### 2025-08-05: `feat: add location tracking and enhance logging`

- **Location Tracking**: Integrated IP-based geolocation to record the country and city for each analytics event.
- **Dashboard Visualization**: Added a world map and a "Top Countries" table to the dashboard to visualize visitor locations.
- **API and Database**: Implemented the necessary API endpoints and database schema changes to support location data.
- **Developer Experience**: Configured the Fastify logger to use `pino-pretty` for more human-readable output during development.
