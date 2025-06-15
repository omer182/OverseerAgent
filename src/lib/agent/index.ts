import { getLlmClient } from "../llm/index.js";
import { LlmProvider } from "../../config/env.js";
import { LlmService } from "./ai.js";
import * as MediaUtils from "./media-utils.js";
import { generateSuccessMessage } from "./messages.js";

/**
 * Agent orchestrates the media request workflow by coordinating between
 * specialized services for LLM interactions, media operations, and message formatting.
 */
export class Agent {
  private readonly llmService: LlmService;

  constructor(provider: LlmProvider) {
    const llmClient = getLlmClient(provider);
    this.llmService = new LlmService(llmClient);
  }

  async handleMediaRequest(userMessage: string): Promise<string> {
    console.log("🔍 Handling media request:", userMessage);

    // Step 1: Extract media request parameters using LLM
    const mediaRequest = await this.llmService.extractMediaRequest(userMessage);
    console.log("🔍 Media request:", mediaRequest);

    // Step 2: Search for media and get profiles
    const [searchResults, profiles] = await Promise.all([
      MediaUtils.searchAndEnrichMedia(mediaRequest.title, mediaRequest.mediaType),
      MediaUtils.getProfiles(mediaRequest.mediaType)
    ]);
    console.log("🔍 Search results:", searchResults);
    console.log("🔍 Profiles:", profiles);

    // Step 3: Let LLM select the best match
    const simplifiedResults = MediaUtils.simplifySearchResults(searchResults);
    const selection = await this.llmService.selectMedia(userMessage, simplifiedResults, profiles);
    console.log("🔍 Selected media index:", selection.index, "Profile:", selection.profile);

    // Step 4: Get and enrich selected media
    const selectedMediaCandidate = searchResults[selection.index];
    if (!selectedMediaCandidate) {
      throw new Error(`Invalid media selection index: ${selection.index}`);
    }
    const selectedMedia = await MediaUtils.enrichMedia(selectedMediaCandidate);
    console.log("🔍 Enriched selected media:", selectedMedia);

    // Step 5: Determine needed seasons
    const neededSeasons = MediaUtils.determineNeededSeasons(selectedMedia, mediaRequest.seasons);
    console.log("🔍 Seasons needed:", neededSeasons);

    // Step 6: Check if already available
    const availabilityMessage = MediaUtils.checkAvailability(selectedMedia, neededSeasons);
    if (availabilityMessage) {
      return availabilityMessage;
    }

    // Step 7: Request the media
    await MediaUtils.requestMediaForUser(selectedMedia, mediaRequest, selection, neededSeasons);

    // Step 8: Return success message
    return generateSuccessMessage(selectedMedia, mediaRequest, neededSeasons);
  }
}