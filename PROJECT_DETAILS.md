# Telemetry: Project Details and Changelog

## 1. Project Overview

**Telemetry** is a privacy-focused, open-source analytics platform designed to provide meaningful insights without compromising user privacy. It's built for creators, developers, and anyone who believes in a more transparent and honest web.

### Guiding Principles

- **Privacy is Paramount**: Telemetry is cookieless by design. It does not track individuals across the web and avoids collecting unnecessary personal data. The focus is on aggregated insights that respect visitor privacy.
- **Clarity Over Clutter**: The dashboard provides simple, actionable metrics like page views, unique visitors, and bounce rates, presented in a clean and intuitive interface.
- **You Own Your Data**: As a self-hosted solution, your website's data resides on your own infrastructure, giving you complete control.
- **Built with Passion**: The project is crafted using modern technologies like Fastify, React, and TypeScript, reflecting a commitment to quality and maintainability.

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
  3. On page load, it automatically captures a `pageview` event, collecting information like:
     - Hostname, path, and referrer
     - Screen dimensions
     - UTM parameters from the URL
  4. It uses `navigator.sendBeacon()` to send this data to the backend API (`/api/track`) reliably, without impacting the subsequent page's load time.
  5. A global `window.telemetry.goal(goalName)` function is exposed, allowing website owners to track custom conversion events (e.g., newsletter sign-ups, button clicks).

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
  - **Create New Site**: Users can add a new website (tenant) to their account with optional allowed domains.
  - **View Embed Script**: For each site, the page displays the unique `<script>` tag that needs to be embedded.
  - **Manage Domains**: Users can add or remove allowed domains for CORS. Only requests from registered domains are accepted.
  - **Delete Site**: Users can permanently delete a site and all its associated analytics data.

## 3. API Reference

The backend is a Fastify server. All API routes are defined in the `src/routes/` directory.

### `POST /api/track`

- **File**: `src/routes/track.ts`
- **Description**: The main endpoint for collecting analytics data from the `analytics.js` script.
- **Request Body**: A JSON object that can be a `pageview`, `goal`, `outbound`, `performance`, or `scroll` event.
  - **`pageview`**: `{ type: "pageview", tenantId, hostname, path, browser, os, language, sessionId, ... }`
  - **`goal`**: `{ type: "goal", tenantId, goalName, properties?, sessionId, ... }`
  - **`outbound`**: `{ type: "outbound", tenantId, url, domain, path, sessionId }`
  - **`performance`**: `{ type: "performance", tenantId, path, lcp, fid, cls, ttfb, fcp, sessionId }`
  - **`scroll`**: `{ type: "scroll", tenantId, path, scrollDepth, sessionId }`
- **Processing**:
  1. Validates the incoming event against `createEventSchema`.
  2. Verifies that the `tenantId` exists.
  3. Anonymizes the user by creating a unique `visitorId` hash from their IP address, User-Agent, and a server-side salt. This ensures privacy as the raw IP is not stored with the event.
  4. Uses the `maxmind` library to perform a GeoIP lookup on the request IP to determine the country and city.
  5. Saves the event to the `Event` table in the database.
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
- **`GET /api/stats/insights`**: Returns automated insights (trending pages, significant changes, top referrers).
- **`GET /api/export/events`**: Exports events as CSV or JSON. Params: `tenantId`, `format` (csv/json), `startDate`, `endDate`, `limit`.

## 4. Database Schema

The schema is defined in `prisma/schema.prisma`.

- **`User`**: Stores user information (email, name, image).
- **`Account`**: Links a `User` to an OAuth provider (e.g., GitHub).
- **`Tenant`**: Represents a website being tracked.
- **`TenantUser`**: A join table linking `User` and `Tenant`, defining roles (e.g., 'ADMIN', 'MEMBER').
- **`Event`**: The central table for all analytics data. It stores pageviews, goals, outbound clicks, performance metrics, scroll depth, location data, browser/OS/language info, session tracking, UTM parameters, custom event properties, and the anonymized `visitorId`.

## 5. Changelog

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
- **Automated Insights**: New `GET /api/stats/insights` endpoint detecting significant metric changes, trending pages, and top referrers.
- **Data Export**: New `GET /api/export/events` endpoint supporting CSV and JSON formats with date range filtering.
- **Dashboard UI**: Added custom date range picker, segment filter bar (browser/OS/country/language/device), automated insights cards, session metrics, scroll depth cards, browser/OS/language tables, outbound links table, Core Web Vitals panel with color-coded p75 values, and data export button.

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
