import { MapPin } from "lucide-react";
import { LocationSection } from "@/components/dashboard/LocationSection";
import { TableCard } from "@/components/dashboard/TableCard";
import { TechSection } from "@/components/dashboard/TechSection";
import { useStat } from "@/hooks/useStat";
import type {
  BrowsersResponse,
  CitiesResponse,
  DevicesResponse,
  LanguagesResponse,
  LocationsResponse,
  OsResponse,
} from "@/lib/types/dashboard.types";

export default function AudiencePage() {
  const locations = useStat<LocationsResponse>("locations");
  const cities = useStat<CitiesResponse>("cities");
  const devices = useStat<DevicesResponse>("devices");
  const browsers = useStat<BrowsersResponse>("browsers");
  const os = useStat<OsResponse>("os");
  const languages = useStat<LanguagesResponse>("languages");

  return (
    <>
      <LocationSection data={locations.data} />
      <TableCard
        title="Top Cities"
        icon={MapPin}
        data={cities.data?.cities ?? []}
        labelKey="city"
        valueKey="views"
        valueLabel="Views"
      />
      <TechSection
        browsers={browsers.data}
        os={os.data}
        languages={languages.data}
        devices={devices.data}
      />
    </>
  );
}
