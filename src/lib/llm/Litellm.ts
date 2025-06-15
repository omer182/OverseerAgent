import { LlmClient, LlmCallArgs, LlmResult } from "./types.js";
import { config } from "../../config/env.js";

export class LiteLlmClient implements LlmClient {
  defaultModel = "gpt-4o-mini";
  apiKey: string | undefined;
  baseUrl: string;
  model: string;
  temperature: number;

  constructor() {
    this.apiKey = config.llm.apiKey;
    this.baseUrl = config.llm.baseUrl || "http://localhost:4000";
    this.model = config.llm.model || this.defaultModel;
    this.temperature = config.llm.temperature;
  }

  async call({ system, messages, model }: LlmCallArgs): Promise<LlmResult> {
    const targetModel = model || this.model;
    
    const requestBody = {
      model: targetModel,
      temperature: this.temperature,
      messages: [{ role: "system", content: system }, ...messages],
    };

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(this.apiKey && { "Authorization": `Bearer ${this.apiKey}` }),
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`LiteLLM API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Invalid response format from LiteLLM API");
    }

    return { final_response: data.choices[0].message.content };
  }
}