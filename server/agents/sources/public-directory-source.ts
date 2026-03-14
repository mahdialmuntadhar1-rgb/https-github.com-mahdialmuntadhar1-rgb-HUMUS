import type { CrawlTile, RawBusinessRecord } from "../../crawler/types.js";
import { BaseSourceAdapter } from "./base-source.js";

export class PublicDirectorySource extends BaseSourceAdapter {
  sourceName = "public_directory";

  async collectBusinesses(tile: CrawlTile): Promise<RawBusinessRecord[]> {
    return this.buildMock(tile, "Service Center");
  }
}
