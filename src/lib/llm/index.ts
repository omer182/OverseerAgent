import GeminiProvider from './GeminiProvider.js';
import AnthropicProvider from './AnthropicProvider.js';
import ModelProvider, { MediaIntent } from './ModelProvider.js';

/**
 * Factory function to create the appropriate LLM provider based on configuration
 * @param {string} provider - The provider name (e.g., 'gemini', 'anthropic')
 * @param {string} apiKey - The API key for the provider
 * @returns {ModelProvider} - An instance of the appropriate provider
 * @throws {Error} - If the provider is unsupported or configuration is invalid
 */
export function createProvider(provider: string, apiKey: string): ModelProvider {
  if (!provider) {
    throw new Error("LLM_PROVIDER environment variable is required");
  }

  if (!apiKey) {
    throw new Error(`API key is required for provider: ${provider}`);
  }

  switch (provider.toLowerCase()) {
    case 'gemini':
      console.log("🔮 Initializing Gemini provider");
      return new GeminiProvider(apiKey);
    case 'anthropic':
      console.log("🪶 Initializing Anthropic provider");
      return new AnthropicProvider(apiKey);
    default:
      throw new Error(`Unsupported LLM provider: ${provider}. Supported providers: gemini, anthropic`);
  }
}

/**
 * Main function to invoke chat model for media intent extraction
 * Uses the configured LLM provider from environment variables
 * @param {string} userPrompt - The user's input prompt
 * @returns {Promise<MediaIntent>} - Parsed JSON response containing media intent
 * @throws {Error} - If the LLM call fails or configuration is invalid
 */
export async function invokeChatModel(userPrompt: string): Promise<MediaIntent> {
  const providerName = process.env.LLM_PROVIDER?.toLowerCase();
  let apiKey: string | undefined;

  if (!providerName) {
    throw new Error("LLM_PROVIDER environment variable is not set or is empty.");
  }

  apiKey = process.env.LLM_API_KEY;

  if (!apiKey) {
    // This check is technically redundant if validateLLMConfig has run, but good for safety.
    throw new Error(`API key for provider ${providerName} is not defined. Please check your environment variables.`);
  }

  const providerInstance = createProvider(providerName, apiKey);
  
  try {
    return await providerInstance.generateResponse(userPrompt);
  } catch (err: unknown) {
    console.error(`❌ Error in invokeChatModel with ${providerName} provider:`, err instanceof Error ? err.message : String(err));
    // Re-throw the original error to preserve its type and details for upstream handlers
    throw err; 
  }
}

/**
 * Validate LLM configuration at startup
 * @throws {Error} - If configuration is invalid or missing
 */
export function validateLLMConfig(): void {
  const provider = process.env.LLM_PROVIDER;
  const supportedProviders = ['gemini', 'anthropic'];

  if (!provider) {
    throw new Error(`❌ LLM_PROVIDER environment variable is required. Set it to one of: ${supportedProviders.join(', ')}.`);
  }

  const lowerCaseProvider = provider.toLowerCase();

  if (!supportedProviders.includes(lowerCaseProvider)) {
    throw new Error(`❌ Unsupported LLM provider: ${provider}. Supported providers: ${supportedProviders.join(', ')}.`);
  }

  if (!process.env.LLM_API_KEY) {
    throw new Error("❌ LLM_API_KEY environment variable is required when using Anthropic provider.");
  }

  console.log(`✅ LLM configuration validated: ${provider}`);
}