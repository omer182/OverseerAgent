import { Seasons } from "../services/seasons.js";

// Domain Models (what consumers use)
export type MediaType = 'movie' | 'tv';
export type MediaStatus = 'unknown' | 'pending' | 'processing' | 'partially_available' | 'available';

export interface MediaModel {
  id: number;
  title: string;
  year: number;
  popularity: number;
  mediaType: MediaType;
  status?: MediaStatus;
  seasons?: Seasons
}

export interface SeasonModel {
  seasonNumber: number;
  status?: MediaStatus;
}

export interface ProfileModel {
  id: number;
  name: string;
  cutoff: number;
  items: ProfileItemModel[];
}

export interface ProfileItemModel {
  quality: {
    id: number;
    name: string;
  };
  allowed: boolean;
} 