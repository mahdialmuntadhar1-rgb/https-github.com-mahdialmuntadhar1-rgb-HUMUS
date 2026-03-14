import type { CollectorSource, CrawlTile, RawBusinessRecord } from "../../crawler/types.js";

export abstract class BaseSourceAdapter implements CollectorSource {
  abstract sourceName: string;
  abstract collectBusinesses(tile: CrawlTile): Promise<RawBusinessRecord[]>;

  protected buildMock(tile: CrawlTile, kind: string): RawBusinessRecord[] {
    return Array.from({ length: 2 }).map((_, idx) => ({
      name: `${kind} ${tile.city} ${Math.floor(tile.lat * 1000)}-${Math.floor(tile.lng * 1000)}-${idx}`,
      category: kind,
      city: tile.city,
      address: `${tile.city} tile ${tile.lat.toFixed(3)}, ${tile.lng.toFixed(3)}`,
      phone: `+96478${Math.floor(Math.random() * 10000000).toString().padStart(7, "0")}`,
      website: `https://${kind.toLowerCase().replace(/\s+/g, "-")}.iraq-compass.local/${idx}`,
      lat: tile.lat + (Math.random() - 0.5) * 0.004,
      lng: tile.lng + (Math.random() - 0.5) * 0.004,
      source: this.sourceName,
      source_url: `https://${this.sourceName.toLowerCase().replace(/\s+/g, "-")}.local/search`,
      metadata: { tileId: tile.id },
    }));
  }
}
