(function () {
  const scriptEl = document.currentScript;
  if (!scriptEl) return;

  const tenantId = scriptEl.getAttribute("data-tenant-id");
  if (!tenantId) {
    console.error("Telemetry: Missing tenant ID in script tag.");
    return;
  }

  const payload = {
    tenantId: tenantId,
    hostname: window.location.hostname,
    path: window.location.pathname,
    referrer: document.referrer,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
  };

  const endpoint = "http://localhost:3000/api/track";

  const blob = new Blob([JSON.stringify(payload)], {
    type: "application/json",
  });

  navigator.sendBeacon(endpoint, blob);
})();
