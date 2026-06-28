(function () {
  var scriptEl = document.currentScript;
  if (!scriptEl) return;

  var tenantId = scriptEl.getAttribute("data-tenant-id");
  if (!tenantId) {
    console.error("Telemetry: Missing tenant ID in script tag.");
    return;
  }

  var apiKey = scriptEl.getAttribute("data-api-key") || "";

  var scriptOrigin = scriptEl.src
    ? new URL(scriptEl.src).origin
    : window.location.origin;
  var endpoint = scriptOrigin + "/api/track";

  // --- UA Parsing ---
  var ua = navigator.userAgent;
  function parseUA(str) {
    var browser = "Other",
      browserVersion = "",
      os = "Other",
      osVersion = "";

    // Browser detection
    if (/Edg\/(\d+)/.test(str)) {
      browser = "Edge";
      browserVersion = RegExp.$1;
    } else if (/OPR\/(\d+)/.test(str) || /Opera\/(\d+)/.test(str)) {
      browser = "Opera";
      browserVersion = RegExp.$1;
    } else if (/Chrome\/(\d+)/.test(str) && !/Edg|OPR|Opera/.test(str)) {
      browser = "Chrome";
      browserVersion = RegExp.$1;
    } else if (/Firefox\/(\d+)/.test(str)) {
      browser = "Firefox";
      browserVersion = RegExp.$1;
    } else if (/Version\/(\d+).*Safari/.test(str)) {
      browser = "Safari";
      browserVersion = RegExp.$1;
    }

    // OS detection
    if (/Windows NT (\d+\.\d+)/.test(str)) {
      os = "Windows";
      var v = parseFloat(RegExp.$1);
      osVersion =
        v === 10.0
          ? "10"
          : v === 6.3
            ? "8.1"
            : v === 6.2
              ? "8"
              : v === 6.1
                ? "7"
                : String(v);
    } else if (/Mac OS X (\d+[._]\d+)/.test(str)) {
      os = "macOS";
      osVersion = RegExp.$1.replace("_", ".");
    } else if (/Android (\d+[\.\d]*)/.test(str)) {
      os = "Android";
      osVersion = RegExp.$1;
    } else if (/iPhone|iPad/.test(str) && /OS (\d+[._]\d+)/.test(str)) {
      os = "iOS";
      osVersion = RegExp.$1.replace("_", ".");
    } else if (/Linux/.test(str)) {
      os = "Linux";
    } else if (/CrOS/.test(str)) {
      os = "ChromeOS";
    }

    return {
      browser: browser,
      browserVersion: browserVersion,
      os: os,
      osVersion: osVersion,
    };
  }

  var parsedUA = parseUA(ua);

  // --- Session Tracking ---
  function getSessionId() {
    var sid = sessionStorage.getItem("_tid");
    if (!sid) {
      sid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
        /[xy]/g,
        function (c) {
          var r = (Math.random() * 16) | 0;
          var v = c === "x" ? r : (r & 0x3) | 0x8;
          return v.toString(16);
        },
      );
      sessionStorage.setItem("_tid", sid);
    }
    return sid;
  }

  var sessionId = getSessionId();
  var language = navigator.language || navigator.userLanguage || "";

  // --- Core Send ---
  function sendEvent(payload) {
    var blob = new Blob([JSON.stringify(payload)], {
      type: "application/json",
    });
    navigator.sendBeacon(endpoint, blob);
  }

  // --- Pageview ---
  function trackPageview() {
    var urlParams = new URLSearchParams(window.location.search);
    sendEvent({
      tenantId: tenantId,
      apiKey: apiKey,
      type: "pageview",
      hostname: window.location.hostname,
      path: window.location.pathname,
      referrer: document.referrer,
      screenWidth: window.screen.width,
      screenHeight: window.screen.height,
      utmSource: urlParams.get("utm_source"),
      utmMedium: urlParams.get("utm_medium"),
      utmCampaign: urlParams.get("utm_campaign"),
      utmTerm: urlParams.get("utm_term"),
      utmContent: urlParams.get("utm_content"),
      browser: parsedUA.browser,
      browserVersion: parsedUA.browserVersion,
      os: parsedUA.os,
      osVersion: parsedUA.osVersion,
      language: language,
      sessionId: sessionId,
    });
  }

  // --- Goal Tracking (with optional properties) ---
  function trackGoal(goalName, properties) {
    if (!goalName || typeof goalName !== "string") {
      return console.error("Telemetry: Goal name must be a non-empty string.");
    }
    var payload = {
      tenantId: tenantId,
      apiKey: apiKey,
      type: "goal",
      goalName: goalName,
      sessionId: sessionId,
    };
    if (properties && typeof properties === "object") {
      payload.properties = properties;
    }
    sendEvent(payload);
  }

  // --- Outbound Link Tracking ---
  function trackOutboundClick(e) {
    var link = e.target.closest("a");
    if (!link) return;
    var href = link.href;
    if (!href) return;
    try {
      var url = new URL(href);
      if (url.hostname === window.location.hostname) return;
      sendEvent({
        tenantId: tenantId,
        apiKey: apiKey,
        type: "outbound",
        url: href,
        domain: url.hostname,
        path: url.pathname,
        sessionId: sessionId,
      });
    } catch (_) {
      // invalid URL, skip
    }
  }

  // --- Scroll Depth Tracking ---
  var maxScroll = 0;
  var scrollMarkers = { 25: false, 50: false, 75: false, 100: false };

  function trackScrollDepth() {
    var scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    var docHeight =
      document.documentElement.scrollHeight -
      document.documentElement.clientHeight;
    if (docHeight <= 0) return;
    var pct = Math.round((scrollTop / docHeight) * 100);
    if (pct > maxScroll) maxScroll = pct;
  }

  function sendScrollDepth() {
    if (maxScroll > 0) {
      sendEvent({
        tenantId: tenantId,
        apiKey: apiKey,
        type: "scroll",
        path: window.location.pathname,
        scrollDepth: maxScroll,
        sessionId: sessionId,
      });
    }
  }

  // --- Performance Metrics (Web Vitals) ---
  var perfData = {};
  var perfSent = false;

  function collectPerformanceMetrics() {
    if (perfSent) return;

    try {
      var perf = window.performance;
      var nav = perf.getEntriesByType("navigation");
      if (nav && nav[0]) {
        var n = nav[0];
        perfData.ttfb = Math.round(n.responseStart - n.requestStart);
      }
      var fcpEntry = perf.getEntriesByName("first-contentful-paint")[0];
      if (fcpEntry) {
        perfData.fcp = Math.round(fcpEntry.startTime);
      }

      var script = document.createElement("script");
      script.src =
        "https://cdn.jsdelivr.net/npm/web-vitals@3/dist/web-vitals.umd.js";
      script.onload = function () {
        var webVitals = window.webVitals;
        if (!webVitals) return;

        var collectMetric = function (metric) {
          perfData[metric.name.toLowerCase()] =
            metric.name === "CLS"
              ? parseFloat(metric.value.toFixed(4))
              : Math.round(metric.value);
        };

        webVitals.onLCP(collectMetric);
        webVitals.onCLS(collectMetric);
        webVitals.onINP(collectMetric);

        var sendMetrics = function () {
          if (perfSent) return;
          perfSent = true;

          if (Object.keys(perfData).length > 0) {
            sendEvent({
              tenantId: tenantId,
              apiKey: apiKey,
              type: "performance",
              path: window.location.pathname,
              lcp: perfData.lcp || null,
              cls: perfData.cls || null,
              inp: perfData.inp || null,
              ttfb: perfData.ttfb || null,
              fcp: perfData.fcp || null,
              sessionId: sessionId,
            });
          }
        };

        document.addEventListener("visibilitychange", function () {
          if (document.visibilityState === "hidden") sendMetrics();
        });
        window.addEventListener("beforeunload", sendMetrics);
        window.addEventListener("pagehide", sendMetrics);
      };
      document.head.appendChild(script);
    } catch (_) {
      // Performance API not supported, skip
    }
  }

  // --- Public API ---
  var telemetry = window.telemetry || {};
  window.telemetry = telemetry;
  window.telemetry.goal = trackGoal;
  window.telemetry.pageview = trackPageview;

  // --- Event Listeners ---
  var scrollThrottle = null;
  window.addEventListener(
    "scroll",
    function () {
      if (scrollThrottle) return;
      scrollThrottle = setTimeout(function () {
        trackScrollDepth();
        scrollThrottle = null;
      }, 200);
    },
    { passive: true },
  );

  document.addEventListener("click", trackOutboundClick, { capture: true });
  window.addEventListener("beforeunload", sendScrollDepth);

  // --- Init ---
  trackPageview();
  collectPerformanceMetrics();
})();
