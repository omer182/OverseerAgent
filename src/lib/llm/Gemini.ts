// llm/gemini.ts
import { GoogleGenerativeAI, GenerateContentRequest } from "@google/generative-ai";
import { LlmClient, LlmCallArgs, LlmResult } from "./types.js";
import { config } from "../../config/env.js";

export class GeminiClient implements LlmClient {
  defaultModel = "gemini-2.5-flash-preview-05-20";

  apiKey: string;
  model: string;
  temperature: number;
  constructor() {
    if (!config.llm.apiKey) {
      throw new Error("LLM_API_KEY is required for Gemini provider");
    }
    this.apiKey = config.llm.apiKey;
    this.model = config.llm.model || this.defaultModel;
    this.temperature = config.llm.temperature;
  }

  async call({ system, messages }: LlmCallArgs): Promise<LlmResult> {
    const genAI = new GoogleGenerativeAI(this.apiKey);
    const model = genAI.getGenerativeModel({ 
      model: this.model,
      generationConfig: {
        temperature: this.temperature,
      },
    });

    const request: GenerateContentRequest = {
      contents: [
        { role: "user", parts: [{ text: system }] },
        ...messages.map(m => ({
          role: m.role,
          parts: [{ text: m.content }]
        }))
      ],
    };

    const response = await model.generateContent(request);
    return { final_response: response.response.text() };
  }
}