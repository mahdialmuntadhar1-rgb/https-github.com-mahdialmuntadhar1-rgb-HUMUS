import type { CrawlTile, RawBusinessRecord } from "../../crawler/types.js";
import { BaseSourceAdapter } from "./base-source.js";

export class FacebookPagesSource extends BaseSourceAdapter {
  sourceName = "facebook_pages";

  async collectBusinesses(tile: CrawlTile): Promise<RawBusinessRecord[]> {
    return this.buildMock(tile, "Cafe");
  }
}
