import Anthropic from '@anthropic-ai/sdk';
import ModelProvider, { MediaIntent } from './ModelProvider.js';
import { Tool, ToolUseBlock } from '@anthropic-ai/sdk/resources/messages.mjs';

/**
 * Anthropic Claude provider implementation
 */
class AnthropicProvider extends ModelProvider {
  private anthropic: Anthropic;
  private modelName: string;

  constructor(apiKey: string) {
    super(apiKey);
    if (!apiKey) {
      throw new Error("Anthropic API key is required.");
    }
    this.anthropic = new Anthropic({ apiKey });
    this.modelName = 'claude-3-7-sonnet-20250219'; // Updated to a generally available Sonnet model
  }

  /**
   * Get Anthropic-optimized system prompt for media intent extraction.
   * This prompt guides the model to use the specified tool for JSON output.
   * @returns {string} - The system prompt optimized for Anthropic Claude.
   */
  getSystemPrompt(): string {
    const basePrompt = super.getSystemPrompt(); // Gets the JSON structure and examples
    return `You are a media request assistant. Your task is to analyze the user's request and extract specific details about the media they want.
You MUST use the "media_intent_extractor" tool to provide these details in a structured JSON format.
Do not respond with any text outside of the tool call. Strictly adhere to the tool's input schema.
${basePrompt}`; // Append JSON structure and examples for clarity
  }

  /**
   * Generate a response from Anthropic Claude for media intent extraction.
   * Uses Anthropic's tool feature to enforce structured JSON output.
   * @param {string} userPrompt - The user's input prompt.
   * @returns {Promise<MediaIntent>} - Parsed JSON response containing media intent.
   * @throws {Error} - If the API call fails or response cannot be parsed.
   */
  async generateResponse(userPrompt: string): Promise<MediaIntent> {
    const systemPrompt = this.getSystemPrompt();

    const tools: Tool[] = [{
      name: "media_intent_extractor",
      description: "Extracts media intent details (title, media type, seasons, profile) from a user's request and returns it in JSON format.",
      input_schema: {
        type: "object",
        properties: {
          title: {
            type: "string",
            description: "The exact title of the movie or TV show."
          },
          mediaType: {
            type: "string",
            enum: ["movie", "tv"],
            description: "The type of media, either 'movie' or 'tv'."
          },
          seasons: {
            oneOf: [
              { type: "string", enum: ["all"], description: "Request all seasons for a TV show." },
              { type: "array", items: { type: "integer" }, description: "Array of specific season numbers for a TV show." }
            ],
            description: "Season information. For TV shows, either 'all' for all seasons, or an array of specific season numbers (e.g., [1, 2, 3]). Should be omitted or null for movies."
          },
          profile: {
            type: ["string", "null"],
            enum: ["heb", null],
            description: "The content profile. 'heb' if Hebrew language content is requested, otherwise null or omit."
          }
        },
        required: ["title", "mediaType"]
      }
    }];

    const messages = [
      { role: 'user' as const, content: userPrompt } // Added 'as const' for role
    ];

    try {
      console.log("🪶 Calling Anthropic API...");
      const response = await this.anthropic.messages.create({
        model: this.modelName,
        max_tokens: 512, // Max tokens for the output (JSON within tool call)
        temperature: 0.1, // Low temperature for deterministic JSON
        system: systemPrompt,
        messages: messages,
        tools: tools,
        tool_choice: { type: "tool", name: "media_intent_extractor" }
      });

      if (!response.content || response.content.length === 0) {
        throw new Error("Empty content in response from Anthropic API");
      }

      const toolUseBlock = response.content.find(block => block.type === 'tool_use') as ToolUseBlock | undefined;

      if (!toolUseBlock || !toolUseBlock.input) {
        // If no tool use, check if there's a text response (e.g. refusal)
        const textBlock = response.content.find(block => block.type === 'text');
        if (textBlock && textBlock.type === 'text' && textBlock.text) { // Added type check for textBlock
            throw new Error(`Anthropic API did not use the tool as expected. Response: ${textBlock.text}`);
        }
        throw new Error("Anthropic API response did not include the expected tool_use block or input.");
      }

      const responseJson = toolUseBlock.input;
      
      // The input to the tool is already a JS object if the API call was successful
      // and the model used the tool correctly. We just need to validate its structure.
      console.log("Anthropic response (extracted from tool input):", responseJson);
      // ValidateResponse expects a string, so we stringify the object.
      // The MediaIntent interface will be enforced by validateResponse.
      return super.validateResponse(JSON.stringify(responseJson)); 

    } catch (err: unknown) {
      console.error("❌ Error calling Anthropic API:", err);
      if (err instanceof Anthropic.APIError) {
        let userMessage = `Anthropic API Error: ${err.status} - ${err.name}.`;
        if (err.status === 401) {
          userMessage = "Invalid Anthropic API key. Please check your ANTHROPIC_API_KEY environment variable.";
        } else if (err.status === 403) {
          userMessage = "Anthropic API key does not have permission for the requested action or model.";
        } else if (err.status === 429) {
          userMessage = "Anthropic API rate limit exceeded or quota overage. Please check your usage and limits, or try again later.";
        } else if (err.message.includes(this.modelName)) { // Check against dynamic modelName
            userMessage += ` This might also indicate an issue with model access or the model ID '${this.modelName}' being incorrect/not available to your key.`
        }
        throw new Error(userMessage);
      }
      throw new Error(`Failed to generate response from Anthropic: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}

export default AnthropicProvider; 