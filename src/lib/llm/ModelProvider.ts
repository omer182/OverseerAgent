/**
 * Base class for LLM providers
 * Defines the interface that all LLM providers must implement
 */

export interface MediaIntent {
  title: string;
  mediaType: "movie" | "tv";
  seasons?: "all" | number[];
  profile?: "heb" | null;
}

class ModelProvider {
  protected apiKey: string | undefined;

  constructor(apiKey?: string) {
    if (this.constructor === ModelProvider) {
      throw new Error("ModelProvider is an abstract class and cannot be instantiated directly");
    }
    this.apiKey = apiKey;
  }

  /**
   * Generate a response from the LLM for media intent extraction
   * @param {string} prompt - The user's input prompt
   * @returns {Promise<MediaIntent>} - Parsed JSON response containing media intent
   * @throws {Error} - If the API call fails or response cannot be parsed
   */
  async generateResponse(_userPrompt: string): Promise<MediaIntent> {
    throw new Error("generateResponse method must be implemented by subclass");
  }

  /**
   * Get the system prompt for media intent extraction
   * Each provider can customize this for optimal performance
   * @returns {string} - The system prompt
   */
  getSystemPrompt(): string {
    return `You're an assistant that extracts media request information from user prompts.

Analyze the prompt and return a JSON object with the following structure:
{
  "title": "exact title of the movie/show",
  "mediaType": "movie" or "tv",
  "seasons": "all" or [1,2,3] (array of season numbers, only for TV shows),
  "profile": "heb" or null (if Hebrew content is requested)
}

Examples:
- "I want to watch Breaking Bad season 1" → {"title": "Breaking Bad", "mediaType": "tv", "seasons": [1]}
- "Add all seasons of Friends" → {"title": "Friends", "mediaType": "tv", "seasons": "all"}
- "I need the Hebrew movie Lebanon" → {"title": "Lebanon", "mediaType": "movie", "profile": "heb"}`;
  }

  /**
   * Validate that the response is a valid JSON object with expected structure
   * @param {string} responseText - Raw response text from LLM
   * @returns {MediaIntent} - Validated and parsed JSON object
   * @throws {Error} - If response is invalid or missing required fields
   */
  validateResponse(responseText: string): MediaIntent {
    let parsed: MediaIntent;
    try {
      parsed = JSON.parse(responseText.trim());
    } catch (err: unknown) {
      throw new Error(`Invalid JSON response from LLM: ${err instanceof Error ? err.message : String(err)}`);
    }

    // Validate required fields
    if (!parsed.title || !parsed.mediaType) {
      throw new Error("Response missing required fields: title and mediaType");
    }

    if (!["movie", "tv"].includes(parsed.mediaType as string)) {
      throw new Error("Invalid mediaType: must be 'movie' or 'tv'");
    }
    
    // Ensure seasons is valid if present
    if (parsed.seasons && parsed.mediaType === "movie") {
        throw new Error("Seasons should not be specified for mediaType 'movie'")
    }

    if (parsed.seasons && parsed.mediaType === "tv" && !(parsed.seasons === "all" || (Array.isArray(parsed.seasons) && parsed.seasons.every((s: number) => typeof s === "number")))) {
        throw new Error("Invalid seasons format for mediaType 'tv'. Should be 'all' or an array of numbers.");
    }

    // Ensure profile is valid if present
    if (parsed.profile && parsed.profile !== "heb") {
        throw new Error("Invalid profile value. Should be 'heb' or null/undefined.");
    }

    // After validation, we know the parsed object conforms to MediaIntent
    return parsed;
  }
}

export default ModelProvider; 