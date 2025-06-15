import { SeasonModel } from '../types/overseerr.js';

/**
 * Analyzes season availability and determines which seasons need to be requested
 */
export class Seasons {
  private showEpisodes: SeasonModel[];

  constructor(showEpisodes: SeasonModel[] = []) {
    this.showEpisodes = showEpisodes;
  }

  /**
   * Gets comprehensive season information including first, next, last, and all seasons
   */
  getSeasonInfo(): { first: number | undefined; next: number | undefined; last: number | undefined; all: number[] } {
    if (!this.showEpisodes || this.showEpisodes.length === 0) {
      return {
        first: undefined,
        next: undefined,
        last: undefined,
        all: []
      };
    }

    const lastSeason = this.showEpisodes.at(-1)?.seasonNumber;
    const lastAvailableSeason = this.showEpisodes
      .filter(season => season.status && ["available", "processing"].includes(season.status))
      .map(season => season.seasonNumber)
      .sort((a, b) => a - b)
      .at(-1) || 0;

    const nextSeason = ((): number | undefined => {
      if (!lastAvailableSeason) {
        return 1;
      } else if (lastSeason && lastSeason > lastAvailableSeason) {
        return lastAvailableSeason + 1;
      } else {
        return undefined;
      }
    })();

    return {
      first: this.showEpisodes.at(0)?.seasonNumber,
      next: nextSeason,
      last: lastSeason,
      all: this.showEpisodes.map((season: SeasonModel) => season.seasonNumber)
    };
  }

  /**
   * Determines which seasons need to be requested based on user request and current availability
   */
  determineNeededSeasons(requestedSeasons: "all" | "first" | "last" | "next" | number[]): number[] {
    if (!this.showEpisodes || this.showEpisodes.length === 0) {
      return [];
    }

    const seasonInfo = this.getSeasonInfo();

    console.log("🔍 Season info:", seasonInfo);
    if (typeof requestedSeasons === "string") {
      const season = seasonInfo[requestedSeasons as "first" | "next" | "last"];
      return season ? [season] : [];
    } else {
      return requestedSeasons.filter(season => !seasonInfo.all.includes(season));
    }
  }
} 