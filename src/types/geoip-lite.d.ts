declare module "geoip-lite" {
  interface GeoIpLookup {
    country: string | null;
    region: string | null;
    city: string | null;
    ll: [number, number] | null;
    metro: number | null;
    zip: string | null;
  }
  function lookup(ip: string): GeoIpLookup | null;
  export { lookup };
}
