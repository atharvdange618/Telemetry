# Telemetry

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Dashboard](https://img.shields.io/badge/Dashboard-usetelemetry.vercel.app-blue.svg)](https://usetelemetry.vercel.app)
[![API Server](https://img.shields.io/badge/API-usetelemetry.hogyoku.cloud-green.svg)](https://usetelemetry.hogyoku.cloud)
[![Privacy First](https://img.shields.io/badge/Privacy-Cookieless-success.svg)](#privacy--compliance)

Telemetry is a professional, privacy-first, open-source web analytics platform. Cookieless by design, fully GDPR/CCPA compliant, and weighing in at under 1KB, it offers complete visitor insights with just one line of code.

Eliminate intrusive cookie banners, keep your site lightning fast, and retain absolute ownership of your data.

**Get Started on the Cloud:** [usetelemetry.vercel.app](https://usetelemetry.vercel.app)

---

## Why Telemetry?

- **Zero Cookies, Zero Banner Fatigue**: Telemetry does not use cookies, local storage, or persistent cross-site tracking. You don't need a privacy banner to use Telemetry, improving your site's conversion rates.
- **Privacy-First & Compliant**: Built from the ground up to respect user privacy. We anonymize and aggregate session details immediately on the server. Fully GDPR, CCPA, and PECR compliant.
- **Ultralight Script (<1KB)**: Traditional trackers bloat your bundle size and impact SEO performance. Telemetry loads asynchronously in milliseconds and transmits data efficiently using native browser beaconing.
- **Absolute Data Ownership**: Keep your data safe from advertising giants. Self-host it on your own server or run it securely on our managed cloud.

---

## Key Features

### Real-Time Dashboard

A clean, visual dashboard designed for immediate clarity. See page views, unique visitors, referral traffic, and live engagement metrics.

### Core Web Vitals Tracking

Monitor real-time performance indicators (LCP, INP, CLS, TTFB, FCP) directly from your users' actual sessions. Find speed bottlenecks before they impact your search rankings.

### Funnels & Conversion Analytics

Define multi-step user paths (e.g., Landing Page → Pricing → Sign Up) to track conversion drop-offs and optimize your product flows.

### Cohort Retention Matrices

Visualize weekly user retention cohorts to measure long-term engagement and product stickiness over time.

### Automated Insights & Anomaly Detection

Get automatically flagged for traffic spikes, drop-offs, or behavioral anomalies, ensuring you never miss a critical event.

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
| `/api/stats/insights` | GET    | Get automated anomalies and highlights              |
| `/api/export/events`  | GET    | Export raw event datasets as CSV/JSON               |

For full endpoint definitions and query options, see the [PROJECT_DETAILS.md](PROJECT_DETAILS.md) file.

---

## Tech Stack

- **Backend**: Fastify, Prisma, PostgreSQL
- **Frontend**: React, Vite, Tailwind CSS, shadcn/ui
- **Deployment**: Vercel (Dashboard), CloudPanel / Hostinger KVM VPS (API backend)
- **License**: MIT
