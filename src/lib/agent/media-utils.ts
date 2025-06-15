import { 
  getMediaProfiles, 
  requestMedia, 
  searchMedia, 
  enrichMediaWithDetails 
} from "../../services/overseerrService.js";
import { MediaModel, ProfileModel, MediaType } from "../../types/overseerr.js";
import { MediaRequestParams, MediaSelectionParams, SimplifiedMediaResult } from "./types.js";

export async function searchAndEnrichMedia(title: string, mediaType: MediaType): Promise<MediaModel[]> {
  return await searchMedia(title, mediaType);
}

export async function getProfiles(mediaType: MediaType): Promise<ProfileModel[]> {
  return await getMediaProfiles(mediaType);
}

export async function enrichMedia(media: MediaModel): Promise<MediaModel> {
  return await enrichMediaWithDetails(media);
}

export async function requestMediaForUser(
  selectedMedia: MediaModel,
  mediaRequest: MediaRequestParams,
  selection: MediaSelectionParams,
  neededSeasons?: number[]
): Promise<void> {
  const requestParams: Parameters<typeof requestMedia>[0] = {
    id: selectedMedia.id,
    mediaType: mediaRequest.mediaType,
    seasons: neededSeasons,
  };
  
  if (selection.profile !== null) {
    requestParams.profileId = selection.profile;
  }
  
  await requestMedia(requestParams);
}

export function checkAvailability(media: MediaModel, neededSeasons?: number[]): string | null {
  if (media.mediaType === "movie" && media.status === "available") {
    return `🎬 ${media.title} is already here - enjoy your popcorn! 🍿`;
  }
  
  if (media.mediaType === "tv" && neededSeasons?.length === 0) {
    return `📺 All requested seasons of ${media.title} are ready - happy binge-watching!`;
  }

  return null;
}

export function simplifySearchResults(searchResults: MediaModel[]): SimplifiedMediaResult[] {
  return searchResults.map(result => ({
    title: result.title,
    year: result.year,
    mediaType: result.mediaType,
    popularity: result.popularity
  }));
}

export function determineNeededSeasons(media: MediaModel, seasonRequest?: MediaRequestParams['seasons']): number[] | undefined {
  return seasonRequest 
    ? media.seasons?.determineNeededSeasons(seasonRequest)
    : undefined;
} 