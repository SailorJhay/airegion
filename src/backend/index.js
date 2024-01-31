import { AIRegion } from "./dist/core.js";
import { config } from "./airegion.config.js";

const aiRegion = new AIRegion(config);

await aiRegion.startAI();
