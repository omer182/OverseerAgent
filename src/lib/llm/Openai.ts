// llm/openai.ts
import OpenAI from "openai";
import { LlmClient, LlmCallArgs, LlmResult } from "./types.js";
import { config } from "../../config/env.js";

export class OpenAiClient implements LlmClient {
  defaultModel = "gpt-4o-mini";
  apiKey: string;
  model: string;
  temperature: number;
  constructor() {
    if (!config.llm.apiKey) {
      throw new Error("LLM_API_KEY is required for OpenAI provider");
    }
    this.apiKey = config.llm.apiKey;
    this.model = config.llm.model || this.defaultModel;
    this.temperature = config.llm.temperature;
  }

  async call({ system, messages }: LlmCallArgs): Promise<LlmResult> {
    const openai = new OpenAI({ apiKey: this.apiKey });

    const response = await openai.chat.completions.create({
      model: this.model,
      temperature: this.temperature,
      messages: [{ role: "system", content: system }, ...messages],
    });

    const firstChoice = response.choices[0];
    if (!firstChoice?.message?.content) {
      throw new Error("No content received from OpenAI API");
    }
    
    return { final_response: firstChoice.message.content };
  }
}