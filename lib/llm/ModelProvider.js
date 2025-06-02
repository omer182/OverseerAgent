/**
 * Base class for LLM providers
 * Defines the interface that all LLM providers must implement
 */
class ModelProvider {
  constructor(apiKey) {
    if (this.constructor === ModelProvider) {
      throw new Error("ModelProvider is an abstract class and cannot be instantiated directly");
    }
    this.apiKey = apiKey;
  }

  /**
   * Generate a response from the LLM for media intent extraction
   * @param {string} userPrompt - The user's input prompt
   * @returns {Promise<Object>} - Parsed JSON response containing media intent
   * @throws {Error} - If the API call fails or response cannot be parsed
   */
  async generateResponse(userPrompt) {
    throw new Error("generateResponse method must be implemented by subclass");
  }

  /**
   * Get the system prompt for media intent extraction
   * Each provider can customize this for optimal performance
   * @returns {string} - The system prompt
   */
  getSystemPrompt() {
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
   * @returns {Object} - Validated and parsed JSON object
   * @throws {Error} - If response is invalid or missing required fields
   */
  validateResponse(responseText) {
    let parsed;
    try {
      parsed = JSON.parse(responseText.trim());
    } catch (err) {
      throw new Error(`Invalid JSON response from LLM: ${err.message}`);
    }

    // Validate required fields
    if (!parsed.title || !parsed.mediaType) {
      throw new Error("Response missing required fields: title and mediaType");
    }

    if (!["movie", "tv"].includes(parsed.mediaType)) {
      throw new Error("Invalid mediaType: must be 'movie' or 'tv'");
    }

    return parsed;
  }
}

export default ModelProvider; 