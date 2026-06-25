# Telemetry

Privacy-first, open-source analytics. Cookieless by design, self-hosted, one line of code.

## Quick Start

```bash
git clone https://github.com/atharvdange618/Telemetry.git
cd Telemetry
npm install
```

### 1. Create a GitHub OAuth App

Go to [GitHub Developer Settings](https://github.com/settings/developers) → **New OAuth App**:
- **Homepage URL**: `http://localhost:3000`
- **Authorization callback URL**: `http://localhost:3000/login/github/callback`

Copy the Client ID and Client Secret.

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and fill in:
```env
DATABASE_URL=postgresql://user:password@localhost:5432/telemetry
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
COOKIE_SECRET=run_openssl_rand_base64_32
VISITOR_SALT=run_openssl_rand_base64_32
BASE_URL=http://localhost:3000
FRONTEND_URL=http://localhost:5173
```

Generate secrets:
```bash
openssl rand -base64 32
```

### 3. Set Up Database

```bash
npx prisma migrate dev
```

### 4. Start Development

```bash
# Backend (port 3000)
npm run dev

# Dashboard (port 5173)
cd dashboard && npm install && npm run dev
```

Open `http://localhost:5173`, sign in with GitHub, and you're running.

## Add Analytics to Your Site

Paste this before `</body>` on any page you want to track:

```html
<script async defer src="https://your-server.com/analytics.js" data-tenant-id="YOUR_TENANT_ID"></script>
```

Find your Tenant ID in the dashboard under **Settings**.

### SPA Support

```javascript
// On route change
window.telemetry?.pageview("/new-page");
```

### Goal Tracking

```javascript
// Track conversions
window.telemetry?.goal("signup");

// Track with custom properties
window.telemetry?.goal("purchase", { plan: "pro", amount: 49 });
```

### What's Automatically Tracked

The script automatically captures:
- **Browser & OS**: Name, version (Chrome 125, Windows 11, etc.)
- **Language**: Browser language setting
- **Session ID**: Groups events per visit (stored in sessionStorage)
- **Scroll Depth**: Max scroll percentage on page leave
- **Outbound Links**: Clicks on external links
- **Core Web Vitals**: LCP, INP, CLS, TTFB, FCP (sent once per page load)
- **UTM Parameters**: Source, medium, campaign, term, content
- **Geolocation**: Country and city (server-side via IP)

## Production Deployment

```bash
npm run build
npm start
```

Use PM2 for process management:

```bash
pm2 start ecosystem.config.cjs
```

## Tech Stack

- **Backend**: Fastify, Prisma, PostgreSQL
- **Frontend**: React, Vite, Tailwind CSS, shadcn/ui
- **Auth**: GitHub OAuth, httpOnly cookies
- **Deploy**: Vercel (dashboard), VPS (API)

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/track` | POST | Track pageview, goal, outbound, performance, or scroll event |
| `/api/tenants` | GET/POST | List or create sites |
| `/api/tenants/:id` | PUT/DELETE | Update or delete a site |
| `/api/stats/summary` | GET | Page views, visitors, bounce rate |
| `/api/stats/pages` | GET | Top pages by views |
| `/api/stats/referrers` | GET | Top referrer sources |
| `/api/stats/views-over-time` | GET | Views over time series |
| `/api/stats/sources` | GET | Top UTM sources |
| `/api/stats/campaigns` | GET | UTM mediums and campaigns |
| `/api/stats/devices` | GET | Mobile/tablet/desktop breakdown |
| `/api/stats/engagement` | GET | Pages/session, new vs returning |
| `/api/stats/cities` | GET | Top cities |
| `/api/stats/locations` | GET | Top countries |
| `/api/stats/goals` | GET | Goal completions |
| `/api/stats/compare` | GET | Period vs previous period |
| `/api/stats/browsers` | GET | Top browsers with percentages |
| `/api/stats/os` | GET | Top operating systems with percentages |
| `/api/stats/languages` | GET | Top languages with percentages |
| `/api/stats/sessions` | GET | Session count and avg duration |
| `/api/stats/scroll-depth` | GET | Average scroll depth and distribution |
| `/api/stats/performance` | GET | Core Web Vitals (p50/p75/p90/p99) |
| `/api/stats/outbound` | GET | Top outbound links by clicks |
| `/api/stats/funnels` | POST | Funnel conversion analysis |
| `/api/stats/cohorts` | GET | Weekly cohort retention matrix |
| `/api/stats/insights` | GET | Automated insights and anomalies |
| `/api/export/events` | GET | Export events as CSV or JSON |

## License

ISC
