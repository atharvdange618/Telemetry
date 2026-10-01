# Telemetry

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Dashboard](https://img.shields.io/badge/Dashboard-usetelemetry.vercel.app-blue.svg)](https://usetelemetry.vercel.app)
[![API Server](https://img.shields.io/badge/API-usetelemetry.hogyoku.cloud-green.svg)](https://usetelemetry.hogyoku.cloud)
[![Privacy First](https://img.shields.io/badge/Privacy-Cookieless-success.svg)](#why-telemetry)

Telemetry is a professional, privacy-first, open-source web analytics platform. Cookieless by design, with no raw IPs stored and a tracking script around 3KB gzipped, it reports page views, visitors, referrers, funnels, and Core Web Vitals from a single line of code.

Drop the cookie banner from your stack, keep your site lightning fast, and retain ownership of your data.

**Get Started on the Cloud:** [usetelemetry.vercel.app](https://usetelemetry.vercel.app)

---

## Why Telemetry?

- **Zero Cookies, Zero Banner Code**: Telemetry does not use cookies, local storage, or persistent cross-site tracking. The only thing it stores in the browser is a random session ID in `sessionStorage`, which the browser deletes when the tab closes. There's no consent dialog to ship for it, though whether your site needs one for the rest of its stack is your call.
- **Pseudonymous Visitor IDs**: The server hashes IP, User-Agent, and tenant ID with a salt that rotates every quarter, then discards the raw IP. Country and city are stored too, since the dashboard charts them, so treat the data as personal and decide what to disclose yourself.
- **Small Script (~3KB gzipped)**: One small script, loaded asynchronously in milliseconds. Events go out as cookieless keepalive requests, so sending them never blocks the page and never gets dropped when a visitor navigates away.
- **Your Data, Your Server**: Self-host it on your own server or run it securely on our managed cloud. Nothing is shared with advertising networks.

---

## Key Features

### Dashboard

A clean, visual dashboard designed for immediate clarity. See page views, unique visitors, referral traffic, and engagement metrics, computed from raw events each time you open it.

### Core Web Vitals Tracking

Monitor performance indicators (LCP, INP, CLS, TTFB, FCP) directly from your users' actual sessions. Find speed bottlenecks before they impact your search rankings.

### Funnels & Conversion Analytics

Define multi-step user paths (e.g., Landing Page → Pricing → Sign Up) to track conversion drop-offs and optimize your product flows.

### Cohort Retention Matrices

Visualize weekly user retention cohorts to measure long-term engagement and product stickiness over time.

### Period-Over-Period Insights

When you open the dashboard, it compares the period you selected against the one immediately before it and cards anything worth a second look: page views or visitors moving more than 10%, a top-five page growing more than 50%, or a referrer pulling in over ten visits. Fixed thresholds, recomputed on each load, no model.

### Ingestion Alerts

If `ALERT_WEBHOOK_URL` is set, the server checks hourly and posts to that webhook when a site's last 24 hours fall under 30% of its 7-day average. Sites under 20 events a day are skipped, since normal swings look like outages at that volume. One alert per site per day. Set it to a Discord webhook to get pinged when tracking quietly breaks.

### Location & Device Analytics

Understand your audience. Aggregate browser type, operating systems, languages, screen resolutions, and country/city-level geolocation.

### Engagement Metrics

Automatically capture scroll depth (max percentage) and clicks on outbound links to see how visitors interact with your content.

---

## Quick Start (Cloud & Managed)

To start tracking your website using the hosted service:

1. Sign up/Log in at the Telemetry Dashboard: [usetelemetry.vercel.app](https://usetelemetry.vercel.app).
2. Register a new site under **Settings** to receive your unique **Tenant ID**.
3. Paste the snippet before the closing `</body>` tag on your website:

```html
<script
  async
  defer
  src="https://usetelemetry.hogyoku.cloud/analytics.js"
  data-tenant-id="YOUR_TENANT_ID"
  data-api-key="YOUR_API_KEY"
></script>
```

### Custom Event & Goal Tracking

```javascript
// Track conversions (e.g., signups)
window.telemetry?.goal("signup");

// Track rich custom properties (e.g., purchases)
window.telemetry?.goal("purchase", { plan: "pro", amount: 49 });
```

---

## Security

Telemetry includes built-in protections for the event ingestion endpoint:

- **Bot Detection**: Known bots, crawlers, and scrapers (Googlebot, GPTBot, curl, etc.) are automatically blocked from sending events.
- **Ingestion Alerts**: If `ALERT_WEBHOOK_URL` is set, an hourly check posts to that webhook when a site's last 24 hours fall under 30% of its 7-day average. Catches tracking that broke silently. Off when the variable is unset.
- **Rate Limiting**: The `/api/track` endpoint is rate-limited to 30 requests per minute per IP address. Dashboard API calls are not affected.
- **API Key Authentication**: Each tenant has a unique API key (`tlv_1_...`). When set, only requests with a valid key are accepted. Legacy tenants without a key remain accessible for backwards compatibility.

---

## Self-Hosting & Development

For developers looking to host their own Telemetry instance:

### Prerequisites

- Node.js (v18+)
- PostgreSQL database

### 1. Clone & Install

```bash
git clone https://github.com/atharvdange618/Telemetry.git
cd Telemetry
npm install
```

### 2. Configure Environment Variables

Create a `.env` file in the root directory:

```env
PORT=3000
DATABASE_URL=postgresql://user:password@localhost:5432/telemetry

# GitHub OAuth Setup (Get Client ID/Secret at github.com/settings/developers)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Security Secrets (Generate using: openssl rand -base64 32)
COOKIE_SECRET=your_random_32_char_string
VISITOR_SALT=another_random_32_char_string

# Application URLs
BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173
```

### 3. Run Migrations & Start

```bash
# Push database schema
npx prisma migrate dev

# Run backend (Express/Fastify)
npm run dev

# Run frontend dashboard
cd dashboard
npm install
npm run dev
```

Visit `http://localhost:5173` to access your self-hosted dashboard.

### Or: Run Everything with Docker

Skip steps 1 and 3. With a `.env` holding your GitHub OAuth and security secrets (step 2), run:

```bash
docker compose up
```

This starts Postgres, the API on `:3000`, and the dashboard on `:5173`, with migrations applied and hot reload on both. The compose file sets the database and app URLs itself, so `.env` only needs the secrets. Your GitHub OAuth app's callback URL must be `http://localhost:3000/login/github/callback`.

Reset the database with `docker compose down -v`.

### Production Deployments

For production hosting on a VPS or cloud provider, build the production bundle:

```bash
# Compile TypeScript and generate Prisma clients
npm run build

# Start the Node.js production server
npm start
```

Alternatively, process managers like PM2 can be used:

```bash
pm2 start ecosystem.config.cjs
```

---

## API Reference (Integration)

Telemetry exposes a rich HTTP REST API for exporting metrics or posting events directly:

| Endpoint              | Method | Description                                         |
| --------------------- | ------ | --------------------------------------------------- |
| `/api/track`          | POST   | Log pageviews, custom goals, or performance metrics |
| `/api/stats/summary`  | GET    | Basic stats (views, visitors, bounce rate)          |
| `/api/stats/pages`    | GET    | Most-visited pages                                  |
| `/api/stats/funnels`  | POST   | Query conversion funnel reports                     |
| `/api/stats/cohorts`  | GET    | Retrieve user cohort retention metrics              |
| `/api/stats/insights` | GET    | Compare the selected period against the previous one |
| `/api/export/events`  | GET    | Export raw event datasets as CSV/JSON               |

For full endpoint definitions and query options, see the [PROJECT_DETAILS.md](PROJECT_DETAILS.md) file.

---

## Tech Stack

- **Backend**: Fastify, Prisma, PostgreSQL
- **Frontend**: React, Vite, Tailwind CSS, shadcn/ui
- **Deployment**: Vercel (Dashboard), CloudPanel / Hostinger KVM VPS (API backend)
- **License**: MIT
