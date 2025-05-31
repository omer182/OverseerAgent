import GeminiProvider from './GeminiProvider.js';
import AnthropicProvider from './AnthropicProvider.js';

/**
 * Factory function to create the appropriate LLM provider based on configuration
 * @param {string} provider - The provider name (e.g., 'gemini', 'anthropic')
 * @param {string} apiKey - The API key for the provider
 * @returns {ModelProvider} - An instance of the appropriate provider
 * @throws {Error} - If the provider is unsupported or configuration is invalid
 */
export function createProvider(provider, apiKey) {
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
 * @returns {Promise<Object>} - Parsed JSON response containing media intent
 * @throws {Error} - If the LLM call fails or configuration is invalid
 */
export async function invokeChatModel(userPrompt) {
  const providerName = process.env.LLM_PROVIDER.toLowerCase();
  let apiKey;

  // Get the appropriate API key based on providerName
  // LLM_PROVIDER and corresponding API key are validated at startup by validateLLMConfig in index.js
  if (providerName === 'gemini') {
    apiKey = process.env.GEMINI_API_KEY;
  } else if (providerName === 'anthropic') {
    apiKey = process.env.ANTHROPIC_API_KEY;
  }
  // No default case needed here as startup validation ensures providerName is valid and key exists.

  const providerInstance = createProvider(providerName, apiKey);
  
  try {
    return await providerInstance.generateResponse(userPrompt);
  } catch (err) {
    console.error(`❌ Error in invokeChatModel with ${providerName} provider:`, err.message);
    // Re-throw the original error to preserve its type and details for upstream handlers
    throw err; 
  }
}

/**
 * Validate LLM configuration at startup
 * @throws {Error} - If configuration is invalid or missing
 */
export function validateLLMConfig() {
  const provider = process.env.LLM_PROVIDER;
  const supportedProviders = ['gemini', 'anthropic'];

  if (!provider) {
    throw new Error(`❌ LLM_PROVIDER environment variable is required. Set it to one of: ${supportedProviders.join(', ')}.`);
  }

  const lowerCaseProvider = provider.toLowerCase();

  if (!supportedProviders.includes(lowerCaseProvider)) {
    throw new Error(`❌ Unsupported LLM provider: ${provider}. Supported providers: ${supportedProviders.join(', ')}.`);
  }

  switch (lowerCaseProvider) {
    case 'gemini':
      if (!process.env.GEMINI_API_KEY) {
        throw new Error("❌ GEMINI_API_KEY environment variable is required when using Gemini provider.");
      }
      console.log("✅ LLM configuration validated: Gemini provider");
      break;
    case 'anthropic':
      if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error("❌ ANTHROPIC_API_KEY environment variable is required when using Anthropic provider.");
      }
      console.log("✅ LLM configuration validated: Anthropic provider");
      break;
    // No default needed here as we check against supportedProviders earlier
  }
}

export default {
  invokeChatModel,
  validateLLMConfig,
  createProvider
}; 