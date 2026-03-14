import type { CrawlTile, RawBusinessRecord } from "../../crawler/types.js";
import { BaseSourceAdapter } from "./base-source.js";

export class GovernmentRegistrySource extends BaseSourceAdapter {
  sourceName = "government_registry";

  async collectBusinesses(tile: CrawlTile): Promise<RawBusinessRecord[]> {
    return this.buildMock(tile, "Licensed Business");
  }
}
