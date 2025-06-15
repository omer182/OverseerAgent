// llm/index.ts
import { OpenAiClient } from "./Openai.js";
import { AnthropicClient } from "./Anthropic.js";
import { GeminiClient } from "./Gemini.js";
import { LiteLlmClient } from "./Litellm.js";
import { OllamaClient } from "./Ollama.js";
import { LlmClient } from "./types.js";
import { LlmProvider } from "../../config/env.js";

export function getLlmClient(
  provider: LlmProvider,
): LlmClient {
  switch (provider) {
    case "openai":    return new OpenAiClient();
    case "anthropic": return new AnthropicClient();
    case "gemini":    return new GeminiClient();
    case "litellm":   return new LiteLlmClient();
    case "ollama":    return new OllamaClient();
    default: throw new Error(`Unknown provider ${provider}`);
  }
}