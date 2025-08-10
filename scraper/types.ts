export interface PlayerResult {
  name: string;
  liquipediaUrl: string | null; // Full URL or null if not available
  races: string[]; // e.g. ['Terran'], or ['Terran', 'Random']
  bestFinish: "participant" | "ro16" | "ro8" | "ro4" | "finalist" | "champion";
  country: string; // e.g. 'South Korea', 'Unknown'
}

export interface Tournament {
  id: string;
  season: number;
  year: number;
  url: string;
  finished: boolean;
}

export interface TournamentData extends Tournament {
  results: PlayerResult[];
  finished: boolean;
}
