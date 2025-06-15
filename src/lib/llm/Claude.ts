// llm/anthropic.ts
import Anthropic from "@anthropic-ai/sdk";
import { LlmClient, LlmCallArgs, LlmResult } from "./types.js";
import { config } from "../../config/env.js";

export class AnthropicClient implements LlmClient {
  defaultModel = "claude-sonnet-4-20250514";
  apiKey: string;
  model: string;
  temperature: number;
  constructor() {
    if (!config.llm.apiKey) {
      throw new Error("LLM_API_KEY is required for Anthropic provider");
    }
    this.apiKey = config.llm.apiKey;
    this.model = config.llm.model || this.defaultModel;
    this.temperature = config.llm.temperature;
  }

  async call({ system, messages }: LlmCallArgs): Promise<LlmResult> {
    const anthropic = new Anthropic({ apiKey: this.apiKey });

    const response = await anthropic.messages.create({
      model: this.model,
      system,
      temperature: this.temperature,
      max_tokens: 5000,
      messages: messages.map(m => ({
        role: m.role as "user" | "assistant",
        content: m.content
      })),
    });

    const firstContent = response.content[0];
    if (!firstContent) {
      throw new Error("No content received from Claude API");
    }
    
    if (firstContent.type === "text") {
      return { final_response: firstContent.text };
    }
    
    return { final_response: "" };
  }
}