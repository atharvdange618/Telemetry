(function () {
  const scriptEl = document.currentScript;
  if (!scriptEl) return;

  const tenantId = scriptEl.getAttribute("data-tenant-id");
  if (!tenantId) {
    console.error("Telemetry: Missing tenant ID in script tag.");
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const utmSource = urlParams.get("utm_source");
  const utmMedium = urlParams.get("utm_medium");
  const utmCampaign = urlParams.get("utm_campaign");
  const utmTerm = urlParams.get("utm_term");
  const utmContent = urlParams.get("utm_content");

  const payload = {
    tenantId: tenantId,
    hostname: window.location.hostname,
    path: window.location.pathname,
    referrer: document.referrer,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    utmSource,
    utmMedium,
    utmCampaign,
    utmTerm,
    utmContent,
  };

  const endpoint = "http://localhost:3000/api/track";

  const blob = new Blob([JSON.stringify(payload)], {
    type: "application/json",
  });

  navigator.sendBeacon(endpoint, blob);
})();
