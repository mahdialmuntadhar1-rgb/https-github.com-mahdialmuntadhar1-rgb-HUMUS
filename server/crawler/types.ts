export interface CrawlTile {
  id: string;
  governorate: string;
  city: string;
  lat: number;
  lng: number;
  radius: number;
  status: "pending" | "processing" | "completed" | "failed";
  priority: number;
  last_crawled_at?: string | null;
}

export interface CrawlQueueJob {
  id: string;
  tile_id: string;
  source: string;
  status: "pending" | "processing" | "completed" | "failed";
  attempts: number;
  created_at: string;
  processed_at?: string | null;
  started_at?: string | null;
}

export interface RawBusinessRecord {
  name: string;
  category?: string;
  city?: string;
  address?: string;
  phone?: string;
  website?: string;
  lat?: number;
  lng?: number;
  source_url?: string;
  source: string;
  metadata?: Record<string, unknown>;
}

export interface DataQualityReport {
  business_id?: string;
  issue_type: "duplicate" | "invalid_phone" | "missing_coordinates" | "missing_address" | "outdated_listing";
  severity: "low" | "medium" | "high";
  details: string;
}

export interface CollectorSource {
  sourceName: string;
  collectBusinesses(tile: CrawlTile): Promise<RawBusinessRecord[]>;
}
