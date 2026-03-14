import { randomUUID } from "node:crypto";
import { IRAQ_GOVERNORATE_SEEDS } from "./governorates.js";
import type { CrawlTile } from "./types.js";

const KM_PER_DEGREE_LAT = 111;

export function generateTilesForIraq(tileRadiusMeters = 750): CrawlTile[] {
  const tiles: CrawlTile[] = [];

  for (const seed of IRAQ_GOVERNORATE_SEEDS) {
    const stepKm = (tileRadiusMeters * 2) / 1000;
    const halfSpanKm = seed.spanKm / 2;
    const latStep = stepKm / KM_PER_DEGREE_LAT;

    for (let latKm = -halfSpanKm; latKm <= halfSpanKm; latKm += stepKm) {
      const lat = seed.center.lat + latKm / KM_PER_DEGREE_LAT;
      const lngStep = stepKm / (KM_PER_DEGREE_LAT * Math.cos((lat * Math.PI) / 180));

      for (let lngKm = -halfSpanKm; lngKm <= halfSpanKm; lngKm += stepKm) {
        const lng = seed.center.lng + (lngKm / stepKm) * lngStep;
        tiles.push({
          id: randomUUID(),
          governorate: seed.governorate,
          city: seed.city,
          lat,
          lng,
          radius: tileRadiusMeters,
          status: "pending",
          priority: Math.max(1, Math.round(100 - Math.abs(latKm) - Math.abs(lngKm))),
          last_crawled_at: null,
        });
      }
    }
  }

  return tiles;
}
