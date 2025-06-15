import { LlmClient, LlmCallArgs, LlmResult } from "./types.js";
import { config } from "../../config/env.js";

export class OllamaClient implements LlmClient {
  defaultModel = "llama3.2";
  baseUrl: string;
  model: string;
  temperature: number;

  constructor() {
    this.baseUrl = config.llm.baseUrl || "http://localhost:11434";
    this.model = config.llm.model || this.defaultModel;
    this.temperature = config.llm.temperature;
  }

  async call({ system, messages, model }: LlmCallArgs): Promise<LlmResult> {
    const targetModel = model || this.model;
    
    const requestBody = {
      model: targetModel,
      messages: [{ role: "system", content: system }, ...messages],
      stream: false,
      options: {
        temperature: this.temperature,
      },
    };

    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`Ollama API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    if (!data.message || !data.message.content) {
      throw new Error("Invalid response format from Ollama API");
    }

    return { final_response: data.message.content };
  }
} 