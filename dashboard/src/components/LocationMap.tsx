import { VectorMap } from "@react-jvectormap/core";
import { worldMill } from "@react-jvectormap/world";
import type { LocationsResponse } from "@/lib/types/dashboard.types";

interface LocationMapProps {
  data: LocationsResponse | undefined;
}

export function LocationMap({ data }: LocationMapProps) {
  const mapData: { [key: string]: number } = {};
  data?.locations.forEach((item) => {
    if (item.country) {
      mapData[item.country] = item.views;
    }
  });

  return (
    <div style={{ width: "100%", height: "360px" }}>
      <VectorMap
        map={worldMill}
        backgroundColor="transparent"
        series={{
          regions: [
            {
              attribute: "fill",
              scale: ["var(--muted)", "var(--primary)"],
              values: mapData,
              normalizeFunction: "linear",
            },
          ],
        }}
        onRegionTipShow={(_, el, code) => {
          (el as HTMLElement).innerHTML =
            (el as HTMLElement).innerHTML + ` (Views: ${mapData[code]?.toLocaleString() || 0})`;
        }}
        regionStyle={{
          initial: {
            fill: "var(--muted)",
          },
          hover: {
            fill: "var(--primary)",
            fillOpacity: 0.7,
          },
        }}
      />
    </div>
  );
}

export default LocationMap;
