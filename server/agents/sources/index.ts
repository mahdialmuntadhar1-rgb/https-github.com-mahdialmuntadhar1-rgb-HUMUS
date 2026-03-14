import type { CollectorSource } from "../../crawler/types.js";
import { FacebookPagesSource } from "./facebook-pages-source.js";
import { GooglePlacesSource } from "./google-places-source.js";
import { GovernmentRegistrySource } from "./government-registry-source.js";
import { InstagramBusinessSource } from "./instagram-source.js";
import { OSMOverpassSource } from "./osm-overpass-source.js";
import { PublicDirectorySource } from "./public-directory-source.js";

export function createDefaultSources(): CollectorSource[] {
  return [
    new GooglePlacesSource(),
    new OSMOverpassSource(),
    new FacebookPagesSource(),
    new InstagramBusinessSource(),
    new PublicDirectorySource(),
    new GovernmentRegistrySource(),
  ];
}
