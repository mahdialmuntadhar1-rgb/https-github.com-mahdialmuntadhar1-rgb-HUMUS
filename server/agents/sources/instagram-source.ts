import type { CrawlTile, RawBusinessRecord } from "../../crawler/types.js";
import { BaseSourceAdapter } from "./base-source.js";

export class InstagramBusinessSource extends BaseSourceAdapter {
  sourceName = "instagram";

  async collectBusinesses(tile: CrawlTile): Promise<RawBusinessRecord[]> {
    return this.buildMock(tile, "Boutique");
  }
}
