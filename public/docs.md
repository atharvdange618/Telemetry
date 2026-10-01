# Telemetry Integration Guide

Cookieless web analytics. Events go to your Telemetry server and live in its Postgres database. Two outside services are involved, both described under [Privacy](#privacy).

## Quick Start

### 1. Add the script

Put this in your HTML `<head>`:

```html
<script
  defer
  data-tenant-id="YOUR_TENANT_ID"
  data-api-key="YOUR_API_KEY"
  src="https://your-telemetry-domain.com/analytics.js"
></script>
```

Find your **Tenant ID** and **API Key** on the [Settings](/settings) page after signing in.

### 2. Add your domains

On the [Settings](/settings) page, add every origin the script runs on. Telemetry rejects events from any other origin with a `403`.

- Add each variant you serve: `https://example.com` and `https://www.example.com` count as two origins.
- For local testing, type the scheme and port: `http://localhost:3000`. A bare `localhost:3000` gets saved as `https://localhost:3000` and won't match.

If events are rejected, the script logs the reason to the browser console once, for example `Telemetry: http://localhost:3000 isn't an allowed domain for this site.`

### What the script tracks on its own

| Data                | Details                                                          |
| ------------------- | ---------------------------------------------------------------- |
| **Page views**      | One per full page load. Single-page apps need [one more step](#single-page-apps) |
| **Browser & OS**    | Parsed from the User-Agent in the browser                        |
| **Screen size**     | Width and height                                                 |
| **Language**        | `navigator.language`                                             |
| **Referrer**        | `document.referrer`, stored as the full URL                      |
| **UTM parameters**  | All 5 standard UTM params from the URL                           |
| **Scroll depth**    | Furthest point reached on the page, as a percentage              |
| **Outbound clicks** | Clicks on links to another hostname                              |
| **Web Vitals**      | LCP, CLS, INP (web-vitals 3.5.2), plus TTFB and FCP              |
| **Session ID**      | Tab-scoped random UUID in `sessionStorage`                       |

## Single-Page Apps

The script records a page view when it loads. It does not watch `history` changes, so in React, Next.js or Vue apps every client-side route change is invisible until you call `window.telemetry.pageview()` yourself.

`pageview()` reads the current `location`, so call it after the route has changed. Skip the first render: the script already counted that page view on load.

### Next.js (App Router)

```tsx
"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

export function TelemetryPageviews() {
  const pathname = usePathname();
  const lastPath = useRef(pathname);

  useEffect(() => {
    // Comparing paths skips the first render and React Strict Mode's
    // double effect run in development.
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    window.telemetry?.pageview();
  }, [pathname]);

  return null;
}
```

Render `<TelemetryPageviews />` once in your root `layout.tsx`, and load the script there with `next/script`:

```tsx
import Script from "next/script";

<Script
  src="https://your-telemetry-domain.com/analytics.js"
  data-tenant-id="YOUR_TENANT_ID"
  data-api-key="YOUR_API_KEY"
  strategy="afterInteractive"
/>;
```

### React Router

```tsx
import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export function TelemetryPageviews() {
  const { pathname } = useLocation();
  const lastPath = useRef(pathname);

  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;
    window.telemetry?.pageview();
  }, [pathname]);

  return null;
}
```

Render it inside your router so `useLocation` works.

### Limits in single-page apps

Scroll depth and Web Vitals are measured once per full page load, not per route. Both get reported under the path the visitor was on when they left.

## TypeScript

The script adds `window.telemetry`. Declare it once, for example in `src/telemetry.d.ts`:

```ts
export {};

declare global {
  interface Window {
    telemetry?: {
      goal: (name: string, properties?: Record<string, unknown>) => void;
      pageview: () => void;
    };
  }
}
```

The `?` is deliberate. With `defer` or `afterInteractive`, the script runs after your code may already be running, and it keeps no queue of calls made before it loads. Always call it as `window.telemetry?.goal(...)`.

## Tracking Goals

Goals record actions visitors take on your site, such as sign-ups, purchases or feature use.

```javascript
// Simple goal
window.telemetry?.goal("signup");

// Goal with properties
window.telemetry?.goal("purchase", {
  plan: "pro",
  amount: 29,
  currency: "USD",
});
```

Properties must be a plain object. Telemetry stores them as JSON with the goal.

### Naming goals

- Use **snake_case** or **kebab-case**, and stay consistent
- Be specific: `signup_completed` rather than `signup`
- Put context in properties, not the name: `goal("purchase", { plan: "pro" })`, not `goal("pro_purchase")`

### Viewing goals

The Dashboard's **Top Goals** card lists the 10 goals with the most completions in the selected period. The same data comes from `GET /api/stats/goals`.

## Funnel Analysis

Funnels measure how many visitors move through a sequence of **page paths**, for example `/` → `/pricing` → `/signup` → `/welcome`. Goals are not funnel steps.

A visitor counts toward a step only if they viewed that page at or after the time they reached the step before it. A funnel takes 2 to 10 steps.

### Setting one up

1. Make sure each step is a separate page the script records a view for. In a single-page app, that means the [route change tracking](#single-page-apps) above.
2. In the Dashboard's **Funnel Analysis** card, enter the paths in order and click **Analyze Funnel**.

Paths must match what the script records, which is `location.pathname`: no query string, no hash. If your pages live under a prefix, include it: `/app/signup`, not `/signup`.

To measure a step with no URL of its own, such as a checkout modal, change the route when it opens, or track it as a goal and read it from **Top Goals**.

## Campaign Tracking

The script reads UTM parameters from the URL on each page view. No code needed.

| Parameter      | Description      | Example                           |
| -------------- | ---------------- | --------------------------------- |
| `utm_source`   | Traffic source   | `google`, `twitter`, `newsletter` |
| `utm_medium`   | Marketing medium | `cpc`, `email`, `social`          |
| `utm_campaign` | Campaign name    | `spring_sale`, `product_launch`   |
| `utm_term`     | Paid search term | `analytics+tool`                  |
| `utm_content`  | Ad variation     | `banner_a`, `cta_button`          |

```
https://yoursite.com/pricing?utm_source=newsletter&utm_medium=email&utm_campaign=spring2026
```

Campaign data shows in the Dashboard's Sources section and comes from `GET /api/stats/campaigns`.

## Outbound Link Tracking

The script records clicks on links whose hostname differs from the current page's hostname. It stores the full URL, the hostname and the path.

The check compares hostnames exactly, so a link from `example.com` to `www.example.com` counts as outbound.

## Scroll Depth

The script tracks the furthest point the visitor scrolls, as a percentage of the page, and sends that one number when the page goes away (`pagehide`). Pages too short to scroll and visitors who never scroll send nothing.

The Dashboard shows the average depth and how many visits reached 25%, 50%, 75% and 100%. Data comes from `GET /api/stats/scroll-depth`.

## Performance Metrics (Web Vitals)

The script loads [web-vitals](https://www.npmjs.com/package/web-vitals) 3.5.2 from jsDelivr, pinned with a Subresource Integrity hash. TTFB and FCP come straight from the browser's Performance API.

| Metric   | What it measures          | Good    | Poor    |
| -------- | ------------------------- | ------- | ------- |
| **LCP**  | Largest Contentful Paint  | ≤2500ms | >4000ms |
| **CLS**  | Cumulative Layout Shift   | ≤0.1    | >0.25   |
| **INP**  | Interaction to Next Paint | ≤200ms  | >500ms  |
| **TTFB** | Time to First Byte        | -       | -       |
| **FCP**  | First Contentful Paint    | -       | -       |

Metrics go out once per page load, when the page is hidden or closed. A metric the browser never reported is left out. INP, for example, needs at least one interaction, and FCP is read when the script starts, so it's missing if the page hasn't painted by then.

The send step runs only after web-vitals loads. If your Content Security Policy blocks `cdn.jsdelivr.net`, no performance data gets sent at all.

Data comes from `GET /api/stats/performance`.

## API Key and Allowed Domains

Each site has an API key (`tlv_1_...`), passed as `data-api-key`.

The key sits in your page's HTML where anyone can read it, so don't treat it as a secret. Your **allowed domains** are what stop other sites from sending events as you: browsers always send an `Origin` header on these requests, and Telemetry checks it against your list.

Sites created before API keys existed have no key and accept events without one.

## Browser Only

The tracking endpoint is built for browsers. Sending events from a server doesn't work well:

- Requests with a missing or short User-Agent (under 10 characters, like Node's default `node`) get rejected as bots.
- Visitor IDs come from the request's IP and User-Agent, so every event from one server collapses into one visitor.
- The rate limit of 30 requests per minute applies per IP, so one server hits it fast.

## Stats API and Segment Filters

The `/api/stats/*` endpoints serve the Dashboard and need its signed-in session cookie. The API key does not work for them.

They accept `period` (`24h`, `7d`, `30d`, `90d`), or `startDate` and `endDate` as ISO datetimes, plus these filters:

| Filter      | Values                                                | Example                                |
| ----------- | ----------------------------------------------------- | -------------------------------------- |
| `browser`   | Chrome, Firefox, Safari, Edge, Opera, Other           | `?browser=Chrome`                      |
| `os`        | Windows, macOS, Linux, Android, iOS, ChromeOS, Other  | `?os=Windows`                          |
| `country`   | Country name                                          | `?country=India`                       |
| `language`  | Browser language code, matched exactly                | `?language=en-US`                      |
| `device`    | mobile, tablet, desktop                               | `?device=mobile`                       |
| `referrer`  | Full referrer URL, matched exactly                    | `?referrer=https://www.google.com/`    |
| `utmSource` | UTM source value                                      | `?utmSource=newsletter`                |

`referrer` and `utmSource` exist only on page views, so filtering by them leaves goal, scroll, outbound and performance stats empty.

## Tracking API Reference

### POST /api/track

The script sends events here. You only need this section to debug the script or build your own browser client.

**Headers:**

```
Content-Type: application/json
```

`tenantId` must be the CUID from Settings. Fields not marked required are optional.

**Body (pageview):** `hostname` and `path` required.

```json
{
  "tenantId": "your-tenant-id",
  "apiKey": "tlv_1_...",
  "type": "pageview",
  "hostname": "example.com",
  "path": "/pricing",
  "referrer": "https://google.com/",
  "screenWidth": 1920,
  "screenHeight": 1080,
  "browser": "Chrome",
  "browserVersion": "126",
  "os": "Windows",
  "osVersion": "10",
  "language": "en-US",
  "sessionId": "uuid-here",
  "utmSource": "newsletter",
  "utmMedium": "email",
  "utmCampaign": "spring2026",
  "utmTerm": null,
  "utmContent": null
}
```

**Body (goal):** `goalName` required. `properties` must be an object.

```json
{
  "tenantId": "your-tenant-id",
  "apiKey": "tlv_1_...",
  "type": "goal",
  "goalName": "signup",
  "properties": { "plan": "pro" },
  "sessionId": "uuid-here"
}
```

**Body (outbound):** `url` (a full URL) and `domain` required.

```json
{
  "tenantId": "your-tenant-id",
  "apiKey": "tlv_1_...",
  "type": "outbound",
  "url": "https://example.com/article",
  "domain": "example.com",
  "path": "/article",
  "sessionId": "uuid-here"
}
```

**Body (scroll):** `scrollDepth` (integer, 0 to 100) required.

```json
{
  "tenantId": "your-tenant-id",
  "apiKey": "tlv_1_...",
  "type": "scroll",
  "path": "/blog/post-1",
  "scrollDepth": 75,
  "sessionId": "uuid-here"
}
```

**Body (performance):** every metric optional.

```json
{
  "tenantId": "your-tenant-id",
  "apiKey": "tlv_1_...",
  "type": "performance",
  "path": "/",
  "lcp": 1200,
  "cls": 0.05,
  "inp": 150,
  "ttfb": 200,
  "fcp": 800,
  "sessionId": "uuid-here"
}
```

**Responses:**

- `201`: event recorded
- `400`: body failed validation
- `403`: bot User-Agent, wrong API key, or an `Origin` not in your allowed domains. The body's `message` says which.
- `404`: tenant not found
- `429`: rate limit exceeded (30 requests per minute per IP)
- `500`: server error

## Privacy

- **No cookies.** The session ID lives in `sessionStorage`, scoped to one tab and cleared when it closes.
- **Pseudonymous visitor IDs.** Each is a SHA-256 hash of IP + User-Agent + site, salted with a value that rotates every quarter. The raw IP is never written to the database.
- **Location lookup.** To get country and city, the server sends each event's IP to [ipwho.is](https://ipwho.is), a third-party service. Whether you need consent for this depends on your jurisdiction.
- **Web Vitals library.** Visitors' browsers download web-vitals from `cdn.jsdelivr.net`, so jsDelivr sees their IP and your site's origin.
- **Bot filtering.** Requests whose User-Agent matches common crawlers, headless browsers, HTTP libraries and monitoring tools get rejected and never stored.
