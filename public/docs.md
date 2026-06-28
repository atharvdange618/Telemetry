# Telemetry Integration Guide

Privacy-first web analytics. No cookies, no third-party scripts. All data stays on your server.

## Quick Start

Add the tracking script to your HTML `<head>`:

```html
<script
  defer
  data-tenant-id="YOUR_TENANT_ID"
  data-api-key="YOUR_API_KEY"
  src="https://your-telemetry-domain.com/analytics.js"
></script>
```

Find your **Tenant ID** and **API Key** on the [Settings](/settings) page after signing in.

### What Happens Automatically

Once the script loads, it automatically tracks:

| Feature             | Details                                     |
| ------------------- | ------------------------------------------- |
| **Page views**      | Sent on every page load                     |
| **Browser & OS**    | Parsed from User-Agent                      |
| **Screen size**     | Width and height                            |
| **Language**        | `navigator.language`                        |
| **Referrer**        | `document.referrer`                         |
| **UTM parameters**  | All 5 standard UTM params from URL          |
| **Scroll depth**    | 25%, 50%, 75%, 100% markers                 |
| **Outbound clicks** | External link clicks                        |
| **Web Vitals**      | LCP, CLS, INP, FID, TTFB, FCP (via web-vitals@3) |
| **Session ID**      | Tab-scoped UUID (sessionStorage)            |

No configuration needed for any of these - they work out of the box.

## Tracking Goals

Goals track specific actions users take on your site (sign-ups, purchases, feature usage).

```javascript
// Simple goal
window.telemetry.goal("signup");

// Goal with properties
window.telemetry.goal("purchase", {
  plan: "pro",
  amount: 29,
  currency: "USD",
});

// Goal with custom properties
window.telemetry.goal("feature_used", {
  feature: "export",
  format: "csv",
});
```

### Goal Naming Best Practices

- Use **snake_case** or **kebab-case** - pick one and stay consistent
- Be specific: `signup_completed` rather than `signup`
- Include context in properties, not the name: `goal("purchase", { plan: "pro" })` not `goal("pro_purchase")`
- Common goal names: `signup`, `purchase`, `download`, `contact_form`, `demo_request`

### Viewing Goals in the Dashboard

Goals appear on the Dashboard under the Goals section. You can also filter all stats by goal completions.

## Funnel Analysis

Funnels track multi-step conversion flows (e.g., visit → signup → purchase).

### How It Works

1. Define goals that represent each step in your funnel
2. Track them with `window.telemetry.goal()` on each step
3. View funnel conversion rates on the Dashboard

### Example: E-commerce Funnel

```javascript
// Step 1: Product page view (automatic pageview)
// No code needed - pageview is tracked automatically

// Step 2: Add to cart
window.telemetry.goal("add_to_cart", { product_id: "abc123" });

// Step 3: Checkout started
window.telemetry.goal("checkout_started", { cart_total: 59.99 });

// Step 4: Purchase completed
window.telemetry.goal("purchase_completed", {
  order_id: "ord_456",
  amount: 59.99,
});
```

### Example: SaaS Signup Funnel

```javascript
// Step 1: Landing page (automatic)

// Step 2: Pricing page view (automatic)

// Step 3: Signup started
window.telemetry.goal("signup_started");

// Step 4: Account created
window.telemetry.goal("account_created", { plan: "free" });

// Step 5: First action completed
window.telemetry.goal("first_action_completed");
```

Funnel data is available via `POST /api/stats/funnels` and on the Dashboard.

## Campaign Tracking

UTM parameters are captured automatically from the URL. No code changes needed.

### Supported UTM Parameters

| Parameter      | Description      | Example                           |
| -------------- | ---------------- | --------------------------------- |
| `utm_source`   | Traffic source   | `google`, `twitter`, `newsletter` |
| `utm_medium`   | Marketing medium | `cpc`, `email`, `social`          |
| `utm_campaign` | Campaign name    | `spring_sale`, `product_launch`   |
| `utm_term`     | Paid search term | `analytics+tool`                  |
| `utm_content`  | Ad variation     | `banner_a`, `cta_button`          |

### Example URLs

```
https://yoursite.com/pricing?utm_source=newsletter&utm_medium=email&utm_campaign=spring2026
https://yoursite.com/?utm_source=twitter&utm_medium=social&utm_campaign=launch
```

Campaign data is available via `GET /api/stats/campaigns` and the Sources section on the Dashboard.

## Outbound Link Tracking

External link clicks are tracked automatically. No setup needed.

When a user clicks a link to a different domain, Telemetry records:

- The full URL
- The domain
- The path

Internal links (same domain) are ignored.

## Scroll Depth Tracking

Page scroll depth is tracked automatically at these markers:

- **25%** - user started reading
- **50%** - user is engaged
- **75%** - user read most content
- **100%** - user reached the bottom

Only the maximum scroll depth per page is sent (on `beforeunload`). Data is available via `GET /api/stats/scroll-depth`.

## Performance Metrics (Web Vitals)

Core Web Vitals are collected automatically using the [web-vitals@3](https://www.npmjs.com/package/web-vitals) library loaded from CDN.

| Metric   | What It Measures          | Good    | Poor    |
| -------- | ------------------------- | ------- | ------- |
| **LCP**  | Largest Contentful Paint  | ≤2500ms | >4000ms |
| **CLS**  | Cumulative Layout Shift   | ≤0.1    | >0.25   |
| **INP**  | Interaction to Next Paint | ≤200ms  | >500ms  |
| **FID**  | First Input Delay         | ≤100ms  | >300ms  |
| **TTFB** | Time to First Byte        | -       | -       |
| **FCP**  | First Contentful Paint    | -       | -       |

Metrics are sent when the page becomes hidden (`visibilitychange`, `beforeunload`, `pagehide`). Data is available via `GET /api/stats/performance`.

## API Key Authentication

Each tenant has an API key (`tlv_1_...`) used to authenticate tracking requests.

- The key is passed as `data-api-key` in the script tag
- Legacy tenants without keys still work (backward compatible)
- Find your key on the [Settings](/settings) page

## Segment Filters

All stats endpoints support filtering by these dimensions:

| Filter      | Values                               | Example                 |
| ----------- | ------------------------------------ | ----------------------- |
| `browser`   | Chrome, Firefox, Safari, Edge, Opera | `?browser=Chrome`       |
| `os`        | Windows, macOS, Linux, Android, iOS  | `?os=Windows`           |
| `country`   | Country name                         | `?country=India`        |
| `language`  | Browser language code                | `?language=en`          |
| `device`    | mobile, tablet, desktop              | `?device=mobile`        |
| `referrer`  | Referrer domain                      | `?referrer=google.com`  |
| `utmSource` | UTM source value                     | `?utmSource=newsletter` |

## Tracking API Reference

### POST /api/track

Send events to Telemetry.

**Headers:**

```
Content-Type: application/json
```

**Body (pageview):**

```json
{
  "tenantId": "your-tenant-id",
  "apiKey": "tlv_1_...",
  "type": "pageview",
  "hostname": "example.com",
  "path": "/pricing",
  "referrer": "https://google.com",
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
  "utmCampaign": "spring2026"
}
```

**Body (goal):**

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

**Body (outbound):**

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

**Body (scroll):**

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

**Body (performance):**

```json
{
  "tenantId": "your-tenant-id",
  "apiKey": "tlv_1_...",
  "type": "performance",
  "path": "/",
  "lcp": 1200,
  "cls": 0.05,
  "inp": 150,
  "fid": 80,
  "ttfb": 200,
  "fcp": 800,
  "sessionId": "uuid-here"
}
```

**Responses:**

- `201` - Event recorded
- `400` - Invalid request body
- `403` - Bot detected or invalid API key
- `404` - Tenant not found
- `429` - Rate limit exceeded (30 req/min per IP)
- `500` - Internal server error

## Privacy

- **No cookies** - session tracking uses `sessionStorage` (tab-scoped, cleared on close)
- **No personal data** - visitor IDs are hashed (IP + User-Agent + tenant salt)
- **No third-party requests** - all data stays on your server
- **GDPR compliant** - no consent banner needed
- **Bot filtering** - crawlers and bots are automatically excluded
