# Telemetry: Project Details and Changelog

## 1. Project Overview

**Telemetry** is a privacy-focused, open-source analytics platform designed to provide meaningful insights without compromising user privacy. It's built for creators, developers, and anyone who believes in a more transparent and honest web.

### Guiding Principles

- **Privacy is Paramount**: Telemetry is cookieless by design. It does not track individuals across the web and avoids collecting unnecessary personal data. The focus is on aggregated insights that respect visitor privacy.
- **Clarity Over Clutter**: The dashboard provides simple, actionable metrics like page views, unique visitors, and bounce rates, presented in a clean and intuitive interface.
- **You Own Your Data**: As a self-hosted solution, your website's data resides on your own infrastructure, giving you complete control.
- **Built with Passion**: The project is crafted using modern technologies like Fastify, React, and TypeScript, reflecting a commitment to quality and maintainability.

## 2. Functionality

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
  - **Key Metrics**: At-a-glance cards for **Page Views**, **Unique Visitors**, and **Bounce Rate**.
  - **Visualizations**:
    - **Views Over Time**: A line chart showing page view trends.
    - **Locations**: A world map (`VectorMap`) and a table showing the top countries by page views.
  - **Data Tables**:
    - Top Pages
    - Top Referrers
    - Top UTM Sources
    - Top Goal Completions

### Settings (`dashboard/src/components/SettingsPage.tsx`)

The settings page allows users to manage their sites.

- **Features**:
  - **Create New Site**: Users can add a new website (tenant) to their account.
  - **View Embed Script**: For each site, the page displays the unique `<script>` tag that needs to be embedded.
  - **Delete Site**: Users can permanently delete a site and all its associated analytics data.

## 3. API Reference

The backend is a Fastify server. All API routes are defined in the `src/routes/` directory.

### `POST /api/track`

- **File**: `src/routes/track.ts`
- **Description**: The main endpoint for collecting analytics data from the `analytics.js` script.
- **Request Body**: A JSON object that can be a `pageview` or a `goal` event.
  - **`pageview`**: `{ type: "pageview", tenantId, hostname, path, ... }`
  - **`goal`**: `{ type: "goal", tenantId, goalName }`
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
- **Query Parameters**: All routes require `tenantId` and accept a `period` (`24h`, `7d`, `30d`).

- **`GET /api/stats/summary`**: Returns the core metrics: `pageViews`, `uniqueVisitors`, and `bounceRate`.
- **`GET /api/stats/pages`**: Returns a list of the top 10 most viewed pages.
- **`GET /api/stats/referrers`**: Returns the top 10 referrers.
- **`GET /api/stats/views-over-time`**: Returns data points for the views-over-time line chart.
- **`GET /api/stats/sources`**: Returns the top 10 UTM sources.
- **`GET /api/stats/goals`**: Returns the top 10 completed goals.
- **`GET /api/stats/locations`**: Returns the top 20 countries by page views.

## 4. Database Schema

The schema is defined in `prisma/schema.prisma`.

- **`User`**: Stores user information (email, name, image).
- **`Account`**: Links a `User` to an OAuth provider (e.g., GitHub).
- **`Tenant`**: Represents a website being tracked.
- **`TenantUser`**: A join table linking `User` and `Tenant`, defining roles (e.g., 'ADMIN', 'MEMBER').
- **`Event`**: The central table for all analytics data. It stores pageviews, goals, location data, UTM parameters, and the anonymized `visitorId`.

## 5. Changelog

### 2025-08-05: `feat: add location tracking and enhance logging`

- **Location Tracking**: Integrated IP-based geolocation to record the country and city for each analytics event.
- **Dashboard Visualization**: Added a world map and a "Top Countries" table to the dashboard to visualize visitor locations.
- **API and Database**: Implemented the necessary API endpoints and database schema changes to support location data.
- **Developer Experience**: Configured the Fastify logger to use `pino-pretty` for more human-readable output during development.
