import axios, { AxiosError } from 'axios';
import { config } from '../config/env.js';
import { 
  MediaType, 
  MediaStatus, 
  MediaModel, 
  ProfileModel, 
} from '../types/overseerr.js';
import { Seasons } from './seasons.js';
import {
  SearchResponseDTO,
  SearchResultDTO,
  RequestMediaDTO,
  RequestMediaResponseDTO,
  ProfileDTO,
  ServiceProfileDTO,
  ServiceResponseDTO,
  TvDetailsDTO,
  SettingsResponseDTO,
} from '../types/overseerr-dto.js';
import { ExternalServiceError, TimeoutError } from '../types/errors.js';
import { HttpAdapter, AxiosHttpAdapter } from '../lib/http/adapters.js';


// Overseerr Client
export class OverseerrClient {
  private readonly correlationId: string;

  constructor(
    private readonly httpAdapter: HttpAdapter,
    private readonly baseURL: string,
    private readonly apiKey: string
  ) {
    this.correlationId = Math.random().toString(36).substring(7);
  }

  private get headers(): Record<string, string> {
    return {
      "X-Api-Key": this.apiKey,
      "Content-Type": "application/json",
    };
  }

  private logRequest(endpoint: string, method: string = 'GET'): void {
    console.log(`🔍 [${this.correlationId}] ${method} ${endpoint}`);
  }

  private handleError(error: unknown, endpoint: string): never {
    console.error(`❌ [${this.correlationId}] Error calling ${endpoint}:`, 
      error instanceof Error ? error.message : String(error));

    if (error instanceof AxiosError) {
      const statusCode = error.response?.status;
      const retryAfter = error.response?.headers['retry-after'] 
        ? parseInt(error.response.headers['retry-after']) 
        : undefined;

      if (statusCode === 429) {
        throw new ExternalServiceError(
          'Rate limit exceeded',
          'overseerr',
          statusCode,
          retryAfter
        );
      }

      if (statusCode && statusCode >= 500) {
        throw new ExternalServiceError(
          'Overseerr server error',
          'overseerr',
          statusCode
        );
      }

      throw new ExternalServiceError(
        `Overseerr API error: ${error.message}`,
        'overseerr',
        statusCode
      );
    }

    if (error instanceof Error && error.name === 'ECONNABORTED') {
      throw new TimeoutError('Request timeout', 'overseerr');
    }

    throw new ExternalServiceError(
      'Unknown error occurred',
      'overseerr'
    );
  }

  async searchMedia(title: string, mediaType: MediaType): Promise<MediaModel[]> {
    const endpoint = '/api/v1/search';
    this.logRequest(endpoint);

    try {
      const response = await this.httpAdapter.get<SearchResponseDTO>(
        `${this.baseURL}${endpoint}`,
        {
          params: { query: encodeURIComponent(title) },
          headers: this.headers,
        }
      );

      console.log(`✅ [${this.correlationId}] Search completed successfully`);
      
      const results = response.data.results
        .filter(result => result.mediaType === mediaType)
        .map(result => this.searchResultDtoToModel(result))
        .sort((a, b) => b.popularity - a.popularity);

      return results;
    } catch (error) {
      this.handleError(error, endpoint);
    }
  }

  async getTvDetails(tvId: number): Promise<MediaModel> {
    const endpoint = `/api/v1/tv/${tvId}`;
    this.logRequest(endpoint);

    try {
      const response = await this.httpAdapter.get<TvDetailsDTO>(
        `${this.baseURL}${endpoint}`,
        { headers: this.headers }
      );

      console.log(`✅ [${this.correlationId}] TV details fetched successfully`);
      return this.tvDetailsDtoToModel(response.data);
    } catch (error) {
      this.handleError(error, endpoint);
    }
  }

  async requestMedia(
    params: {
      id: number,
      mediaType: MediaType,
      seasons: number[] | undefined,
      profileId?: number
    }
  ): Promise<RequestMediaResponseDTO> {
    const endpoint = '/api/v1/request';
    this.logRequest(endpoint, 'POST');

    const payload = this.buildRequestPayload(params);

    try {
      const response = await this.httpAdapter.post<RequestMediaResponseDTO>(
        `${this.baseURL}${endpoint}`,
        payload,
        { headers: this.headers }
      );

      console.log(`✅ [${this.correlationId}] Media request completed successfully`);
      return response.data;
    } catch (error) {
      console.log(`❌ [${this.correlationId}] Request failed. Response body:`, JSON.stringify(error instanceof AxiosError ? error.response?.data : error, null, 2));
      this.handleError(error, endpoint);
    }
  }

  async getMediaProfiles(mediaType: MediaType): Promise<ProfileModel[]> {
    const serviceType = mediaType === 'movie' ? 'radarr' : 'sonarr';
    
    // First get the service configuration to get the service ID
    const settingsEndpoint = `/api/v1/settings/${serviceType}`;
    this.logRequest(settingsEndpoint);

    try {
      const settingsResponse = await this.httpAdapter.get<SettingsResponseDTO>(
        `${this.baseURL}${settingsEndpoint}`,
        { headers: this.headers }
      );

      console.log(`🔍 [${this.correlationId}] Settings response:`, JSON.stringify(settingsResponse.data, null, 2));
      
      // Get the services (usually an array)
      const services = Array.isArray(settingsResponse.data) ? settingsResponse.data : [settingsResponse.data];
      if (services.length === 0) {
        console.log(`⚠️ [${this.correlationId}] No ${serviceType} services configured`);
        return [];
      }

      const firstService = services[0];
      if (!firstService) {
        console.log(`⚠️ [${this.correlationId}] No valid ${serviceType} service found`);
        return [];
      }

      const serviceId = firstService.id;
      console.log(`📋 [${this.correlationId}] Using ${serviceType} service ID: ${serviceId}`);

      // Now get the service details with profiles using the correct API endpoint
      const serviceEndpoint = `/api/v1/service/${serviceType}/${serviceId}`;
      this.logRequest(serviceEndpoint);

      const serviceResponse = await this.httpAdapter.get<ServiceResponseDTO>(
        `${this.baseURL}${serviceEndpoint}`,
        { headers: this.headers }
      );

      console.log(`🔍 [${this.correlationId}] Service response:`, JSON.stringify(serviceResponse.data, null, 2));
      
      // Extract profiles from the service response
      let profiles: ServiceProfileDTO[] = [];
      
      if (serviceResponse.data.profiles && Array.isArray(serviceResponse.data.profiles)) {
        profiles = serviceResponse.data.profiles;
        console.log(`📋 [${this.correlationId}] Found profiles in service response`);
      } else if (serviceResponse.data.qualityProfiles && Array.isArray(serviceResponse.data.qualityProfiles)) {
        profiles = serviceResponse.data.qualityProfiles;
        console.log(`📋 [${this.correlationId}] Found qualityProfiles in service response`);
      } else {
        console.log(`⚠️ [${this.correlationId}] No profiles found in service response.`);
        return [];
      }

      console.log(`✅ [${this.correlationId}] Found ${profiles.length} quality profiles`);
      
      return profiles.map(profile => this.profileDtoToModel(profile));
    } catch (error) {
      this.handleError(error, settingsEndpoint);
    }
  }

  async enrichMediaWithDetails(media: MediaModel): Promise<MediaModel> {
    if (media.mediaType === 'tv' && (!media.seasons || media.seasons.getSeasonInfo().all.length === 0)) {
      console.log(`🔍 [${this.correlationId}] Enriching TV show with seasons: ${media.title}`);
      try {
        return await this.getTvDetails(media.id);
      } catch {
        console.log(`⚠️ [${this.correlationId}] Failed to fetch TV details for ${media.title}, using original result`);
        return media;
      }
    }
    return media;
  }

  // Mapping helpers
  private searchResultDtoToModel(dto: SearchResultDTO): MediaModel {
    const seasons = dto.mediaInfo?.seasons?.map(season => ({
      seasonNumber: season.seasonNumber,
      status: season.status ? this.mapStatusFromNumber(season.status) : undefined,
    }));

    return {
      id: dto.id,
      title: dto.title || dto.name,
      year: new Date(dto.releaseDate || dto.firstAirDate).getFullYear(),
      popularity: dto.popularity,
      mediaType: dto.mediaType,
      status: dto.mediaInfo?.status ? this.mapStatusFromNumber(dto.mediaInfo.status) : undefined,
      seasons: new Seasons(seasons),
    };
  }

  private tvDetailsDtoToModel(dto: TvDetailsDTO): MediaModel {
    const seasons = dto.seasons?.map(season => ({
      seasonNumber: season.seasonNumber,
      status: undefined, // TV details don't include status, will be undefined
    }));

    return {
      id: dto.id,
      title: dto.name,
      year: new Date(dto.firstAirDate).getFullYear(),
      popularity: 0, // Not available in TV details
      mediaType: 'tv' as MediaType,
      status: dto.mediaInfo?.status ? this.mapStatusFromNumber(dto.mediaInfo.status) : undefined,
      seasons: new Seasons(seasons),
    };
  }

  private profileDtoToModel(dto: ProfileDTO | ServiceProfileDTO): ProfileModel {
    // Handle both complex DTO structure and simple service response structure
    if ('cutoff' in dto && 'items' in dto && dto.cutoff !== undefined && dto.items !== undefined) {
      // Complex structure from direct API
      return {
        id: dto.id,
        name: dto.name,
        cutoff: dto.cutoff,
        items: dto.items.map((item) => ({
          quality: {
            id: item.quality.id,
            name: item.quality.name,
          },
          allowed: item.allowed,
        })),
      };
    } else {
      // Simple structure from service endpoint
      return {
        id: dto.id,
        name: dto.name,
        cutoff: 0, // Not available in simple structure
        items: [] // Not available in simple structure
      };
    }
  }

  private buildRequestPayload(
    params: {
      id: number,
      mediaType: MediaType,
      seasons: number[] | undefined,
      profileId?: number
    }
  ): RequestMediaDTO {
    const payload: RequestMediaDTO = {
      mediaType: params.mediaType,
      mediaId: params.id,
      profileId: params.profileId || undefined,
    };

    
    if (params.mediaType === 'tv') {
      payload.tvdbId = params.id;
      payload.seasons = params.seasons;
    }
    
    console.log(`🔍 [${this.correlationId}] Building request payload:`, params);
    return payload;
  }

  private mapStatusFromNumber(status: number): MediaStatus {
    switch (status) {
      case 1: return 'unknown';
      case 2: return 'pending';
      case 3: return 'processing';
      case 4: return 'partially_available';
      case 5: return 'available';
      default: return 'unknown';
    }
  }
}

// Factory function for creating the client
export function createOverseerrClient(): OverseerrClient {
  const axiosInstance = axios.create({
    timeout: 10000, // 10 second timeout
  });

  const httpAdapter = new AxiosHttpAdapter(axiosInstance);
  
  return new OverseerrClient(
    httpAdapter,
    config.overseerr.url,
    config.overseerr.apiKey
  );
}

// Legacy exports for backward compatibility (deprecated)
export const searchMedia = async (title: string, mediaType: MediaType): Promise<MediaModel[]> => {
  const client = createOverseerrClient();
  return client.searchMedia(title, mediaType);
};

export const requestMedia = async (
  params: {
    id: number,
    mediaType: MediaType,
    seasons: number[] | undefined,
    profileId?: number
  }
): Promise<RequestMediaResponseDTO> => {
  const client = createOverseerrClient();
  return client.requestMedia(params);
};

export const getTvDetails = async (tvId: number): Promise<MediaModel> => {
  const client = createOverseerrClient();
  return client.getTvDetails(tvId);
};

export const getMediaProfiles = async (mediaType: string): Promise<ProfileModel[]> => {
  if (!mediaType) {
    return [];
  }

  const client = createOverseerrClient();
  return client.getMediaProfiles(mediaType as MediaType);
};

export const enrichMediaWithDetails = async (media: MediaModel): Promise<MediaModel> => {
  const client = createOverseerrClient();
  return client.enrichMediaWithDetails(media);
};