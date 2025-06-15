import { MediaType } from './overseerr.js';

// API DTOs (Overseerr API shapes)
export interface SearchResponseDTO {
  results: SearchResultDTO[];
}

export interface SearchResultDTO {
  id: number;
  title: string;
  name: string;
  releaseDate: string;
  firstAirDate: string;
  popularity: number;
  mediaType: MediaType;
  mediaInfo?: MediaInfoDTO;
}

export interface MediaInfoDTO {
  id: number;
  tmdbId: number;
  tvdbId: number;
  status: number;
  createdAt: string;
  updatedAt: string;
  seasons?: SeasonDTO[];
}

export interface SeasonDTO {
  seasonNumber: number;
  status?: number;
}

export interface TvDetailsDTO {
  id: number;
  name: string;
  overview: string;
  firstAirDate: string;
  seasons: TvSeasonDTO[];
  mediaInfo?: MediaInfoDTO;
}

export interface TvSeasonDTO {
  id: number;
  seasonNumber: number;
  name: string;
  overview: string;
  airDate: string;
  episodeCount: number;
}

export interface RequestMediaDTO {
  mediaType: string;
  mediaId: number;
  profileId?: number;
  tvdbId?: number;
  seasons?: number[];
}

export interface RequestMediaResponseDTO {
  id: number;
  status: number;
  createdAt: string;
  updatedAt: string;
  type: string;
  media: {
    id: number;
    mediaType: string;
    tmdbId: number;
    tvdbId?: number;
    status: number;
    createdAt: string;
    updatedAt: string;
  };
  requestedBy: {
    id: number;
    email: string;
    username: string;
    plexToken?: string;
    plexUsername?: string;
    userType: number;
    permissions: number;
    avatar: string;
    createdAt: string;
    updatedAt: string;
  };
}

export interface ProfilesResponseDTO {
  profiles: ProfileDTO[];
}

export interface ProfileDTO {
  id: number;
  name: string;
  cutoff?: number;
  items?: ProfileItemDTO[];
}

// Service response profile (simplified structure)
export interface ServiceProfileDTO {
  id: number;
  name: string;
}

// Service response containing profiles
export interface ServiceResponseDTO {
  profiles?: ServiceProfileDTO[];
  qualityProfiles?: ServiceProfileDTO[];
}

export interface ProfileItemDTO {
  quality: {
    id: number;
    name: string;
  };
  allowed: boolean;
}

// Settings response DTOs
export interface ServiceSettingsDTO {
  id: number;
  name: string;
  hostname: string;
  port: number;
  apiKey: string;
  useSsl: boolean;
  baseUrl?: string;
  activeProfileId: number;
  activeDirectory: string;
  is4k: boolean;
  minimumAvailability: string;
  isDefault: boolean;
  externalUrl?: string;
  syncEnabled: boolean;
  preventSearch: boolean;
}

export type SettingsResponseDTO = ServiceSettingsDTO | ServiceSettingsDTO[]; 