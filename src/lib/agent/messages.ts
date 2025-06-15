import { MediaModel } from "../../types/overseerr.js";
import { MediaRequestParams } from "./types.js";

export function generateSuccessMessage(
  media: MediaModel, 
  request: MediaRequestParams, 
  neededSeasons?: number[]
): string {
  const qualityText = request.quality ? ` in ${request.quality.toUpperCase()}` : "";
  
  if (request.mediaType === "movie") {
    return `🎬 Added ${media.title} to your watchlist${qualityText}. I'll notify you when it's ready to watch!`;
  }
  
  const seasonsText = neededSeasons?.length 
    ? `seasons ${neededSeasons.join(", ")}` 
    : "all available seasons";
    
  return `📺 Queued ${seasonsText} of ${media.title}${qualityText}. It's coming soon!`;
} 