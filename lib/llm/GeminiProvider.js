import { GoogleGenerativeAI } from '@google/generative-ai';
import ModelProvider from './ModelProvider.js';

/**
 * Google Gemini provider implementation
 */
class GeminiProvider extends ModelProvider {
  constructor(apiKey) {
    super(apiKey);
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
  }

  /**
   * Get Gemini-optimized system prompt for media intent extraction
   * @returns {string} - The system prompt optimized for Gemini
   */
  getSystemPrompt() {
    const basePrompt = super.getSystemPrompt();
    // Modify the introductory line from the base prompt and append Gemini-specific instructions.
    const modifiedBasePrompt = basePrompt.replace(
      "You're an assistant that extracts media request information from user prompts.",
      "You are a media request assistant. Extract media information from user prompts and respond ONLY with valid JSON."
    );
    return `${modifiedBasePrompt}\n\nRespond with JSON only, no additional text or formatting.`;
  }

  /**
   * Generate a response from Gemini for media intent extraction
   * @param {string} userPrompt - The user's input prompt
   * @returns {Promise<Object>} - Parsed JSON response containing media intent
   * @throws {Error} - If the API call fails or response cannot be parsed
   */
  async generateResponse(userPrompt) {
    try {
      const systemPromptText = this.getSystemPrompt();

      console.log("🔮 Calling Gemini API...");
      
      const result = await this.model.generateContent({
        systemInstruction: { role: "system", parts: [{ text: systemPromptText }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: 0,
          maxOutputTokens: 150,
          responseMimeType: "application/json"
        }
      });

      const response = await result.response;
      console.log("Gemini response:", response);
      const responseText = response.text();
      
      console.log("Gemini response:", responseText);

      if (!responseText) {
        throw new Error("Empty response from Gemini API");
      }

      // Validate and return the parsed response
      return this.validateResponse(responseText);

    } catch (err) {
      console.error("❌ Error calling Gemini API:", err.message);
      
      // Handle specific Gemini API errors
      if (err.message.includes('API_KEY_INVALID')) {
        throw new Error("Invalid Gemini API key. Please check your GEMINI_API_KEY environment variable.");
      } else if (err.message.includes('QUOTA_EXCEEDED')) {
        throw new Error("Gemini API quota exceeded. Please check your usage limits.");
      } else if (err.message.includes('RATE_LIMIT_EXCEEDED')) {
        throw new Error("Gemini API rate limit exceeded. Please try again later.");
      }
      
      throw new Error(`Failed to generate response from Gemini: ${err.message}`);
    }
  }
}

export default GeminiProvider; 