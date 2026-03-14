import { CrawlerService } from "../server/crawler/crawler-service.js";
import { CrawlOrchestrator } from "../server/crawler/orchestrator.js";

const orchestrator = new CrawlOrchestrator(new CrawlerService());

async function main() {
  await orchestrator.tick();
  console.log("Orchestrator tick completed");
}

main().catch((error) => {
  console.error("Orchestrator failure", error);
  process.exit(1);
});
