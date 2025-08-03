(function () {
  const scriptEl = document.currentScript;
  if (!scriptEl) return;

  const tenantId = scriptEl.getAttribute("data-tenant-id");
  if (!tenantId) {
    console.error("Telemetry: Missing tenant ID in script tag.");
    return;
  }

  const endpoint = "http://localhost:3000/api/track";

  function sendEvent(payload) {
    const blob = new Blob([JSON.stringify(payload)], {
      type: "application/json",
    });
    navigator.sendBeacon(endpoint, blob);
  }

  function trackGoal(goalName) {
    if (!goalName || typeof goalName !== "string") {
      return console.error("Telemetry: Goal name must be a non-empty string.");
    }

    const goalPayload = {
      tenantId,
      type: "goal",
      goalName: goalName,
    };
    sendEvent(goalPayload);
  }

  function trackPageview() {
    const urlParams = new URLSearchParams(window.location.search);
    const pageviewPayload = {
      tenantId: tenantId,
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
    };
    sendEvent(pageviewPayload);
  }

  const telemetry = window.telemetry || {};
  window.telemetry = telemetry;
  window.telemetry.goal = trackGoal;

  trackPageview();
})();
