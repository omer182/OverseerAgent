// llm/types.ts

export interface LlmCallArgs {
  system: string;
  messages: { role: "user" | "assistant" | "system"; content: string }[];
  /** Optional explicit model ID, e.g. "gpt-4o-mini" or "claude-3-haiku". */
  model?: string;
}

export interface LlmResult {
  final_response: string;
}

export interface LlmClient {
  /** provider-specific default model (e.g. GPT-4o, Claude Sonnet, etc.) */
  defaultModel: string;
  call(args: LlmCallArgs): Promise<LlmResult>;
}
