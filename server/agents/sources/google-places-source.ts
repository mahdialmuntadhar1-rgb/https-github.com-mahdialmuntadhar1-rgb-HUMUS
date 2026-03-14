import type { CrawlTile, RawBusinessRecord } from "../../crawler/types.js";
import { BaseSourceAdapter } from "./base-source.js";

export class GooglePlacesSource extends BaseSourceAdapter {
  sourceName = "google_places";

  async collectBusinesses(tile: CrawlTile): Promise<RawBusinessRecord[]> {
    return this.buildMock(tile, "Restaurant");
  }
}
