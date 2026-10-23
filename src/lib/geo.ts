import maxmind, { CityResponse, Reader } from "maxmind";
import type { FastifyBaseLogger } from "fastify";

let reader: Reader<CityResponse> | null = null;

// MaxMind spells these differently from the names already stored and keyed
// in the dashboard's map, so new rows would split from old ones.
const COUNTRY_RENAMES: Record<string, string> = {
  "The Netherlands": "Netherlands",
  Türkiye: "Turkey",
  Czechia: "Czech Republic",
};

// The lookup runs against a local MaxMind file, so visitor IPs never leave
// the server. When geoipupdate replaces the file, the watcher reloads it
// without a restart.
export async function loadGeoDatabase(path: string, log: FastifyBaseLogger): Promise<void> {
  try {
    reader = await maxmind.open<CityResponse>(path, {
      watchForUpdates: true,
      watchForUpdatesNonPersistent: true,
    });
  } catch (err) {
    log.warn({ err, path }, "GeoIP database not loaded; events will have no country or city");
  }
}

// Private and malformed IPs aren't in the database, so they come back null.
export function getGeoLocation(ip: string): { country: string | null; city: string | null } {
  const result = reader?.get(ip);
  const country = result?.country?.names.en ?? null;
  return {
    country: country ? (COUNTRY_RENAMES[country] ?? country) : null,
    city: result?.city?.names.en ?? null,
  };
}
