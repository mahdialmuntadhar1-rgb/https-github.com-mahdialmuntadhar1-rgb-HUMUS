import { CrawlerService } from "./crawler-service.js";

export class CrawlOrchestrator {
  constructor(private crawler = new CrawlerService()) {}

  async tick() {
    await this.crawler.seedTilesIfEmpty();
    await this.crawler.refillQueue();
    await this.crawler.detectStalledJobs();
    await this.crawler.retryFailedJobs();
  }
}
