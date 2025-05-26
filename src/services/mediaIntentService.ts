import { invokeChatModel } from "../lib/llm/index.js";

export interface MediaIntent {
  title: string;
  mediaType: "movie" | "tv";
  seasons?: "all" | number[];
  profile?: "heb" | null;
}

export async function extractMediaIntent(prompt: string): Promise<MediaIntent> {
  try {
    return await invokeChatModel(prompt);
  } catch (err: any) {
    console.error("❌ Error extracting media intent:", err);
    throw new Error("Failed to extract media intent");
  }
} 