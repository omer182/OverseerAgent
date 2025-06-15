import z from "zod/v4";

import { LlmClient } from "../llm/types.js";
import { ProfileModel } from "../../types/overseerr.js";
import { 
  MediaRequestParams, 
  MediaSelectionParams, 
  SimplifiedMediaResult,
  MediaRequestParamsSchema,
  MediaSelectionParamsSchema
} from "./types.js";


export class LlmService {
  constructor(private readonly llm: LlmClient) {}

  private MEDIA_REQUEST_PROMPT = `You're an assistant that extracts media request information from user prompts.

  Analyze the prompt and return a JSON object with the following structure:
  {
    "title": "exact title of the movie/show",
    "mediaType": "movie" or "tv",
    "seasons": "all" or [1,2,3] (array of season numbers, only for TV shows),
    "quality": "4K" or "1080p" or "720p" or "HDR" or "Dolby Vision" or null (if quality is requested)
  }
  
  Examples:
  - "I want to watch Breaking Bad season 1" → {"title": "Breaking Bad", "mediaType": "tv", "seasons": [1]}
  - "Add all seasons of Friends" → {"title": "Friends", "mediaType": "tv", "seasons": "all"}
  - "Add the last season of the witcher" → {"title": "The Witcher", "mediaType": "tv", "seasons": "last"}
  - "Add the next season of Andor in hd" → {"title": "Andor", "mediaType": "tv", "seasons": "next", "quality": "1080p"}
  - "I need the Hebrew movie Lebanon" → {"title": "Lebanon", "mediaType": "movie", "quality": "heb"}
  
  Return ONLY that JSON without any markdown formatting.`;

  async extractMediaRequest(userMessage: string): Promise<MediaRequestParams> {
    const response = await this.llm.call({
      system: this.MEDIA_REQUEST_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    return parseJson<MediaRequestParams>(response.final_response, MediaRequestParamsSchema);
  }

  private MEDIA_SELECTION_PROMPT = `You're an assistant that selects the best media and media profile from a list of search results according to the user's request.

Analyze the search results and return the best media index from the list and the profile id.

Examples:
- "I want to watch Breaking Bad season 1" → { "index": 4, "profile": null }
- "I need the movie Shrek" → { "index": 2, "profile": null }
- "Let's watch the departed in 4K" → { "index": 1, "profile": 4 }

Return ONLY the JSON without any markdown formatting.`;
  async selectMedia(
    userMessage: string, 
    searchResults: SimplifiedMediaResult[], 
    profiles: ProfileModel[]
  ): Promise<MediaSelectionParams> {
    const response = await this.llm.call({
      system: this.MEDIA_SELECTION_PROMPT,
      messages: [{ 
        role: "user", 
        content: `
          User request: ${userMessage}
          Profiles: ${JSON.stringify(profiles)}
          Search results: ${JSON.stringify(searchResults)}`
      }],
    });

    return parseJson<MediaSelectionParams>(response.final_response, MediaSelectionParamsSchema);
  }
} 

function parseJson<T>(json: string, schema: z.ZodSchema<T>): T {
  try {
    const parsed = JSON.parse(json);
    const result = schema.safeParse(parsed);
    if (!result.success) {
      result.error.issues.forEach((issue) => {
        console.error(`❌ Response validation error: body.${issue.path.join('.')}: ${issue.message}`);
      });
      throw new Error(`Failed to validate response: ${json}`);
    }
    return result.data;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to parse response: ${error.message}. Original response: ${json}`);
    }
    throw new Error(`Failed to parse response: Unknown error. Original response: ${json}`);
  }
}