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
```

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
| `/api/track` | POST | Track pageview or goal event |
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

## License

ISC
