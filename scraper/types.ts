export interface PlayerResult {
  name: string;
  liquipediaUrl: string | null; // Full URL or null if not available
  races: string[]; // e.g. ['Terran'], or ['Terran', 'Random']
  bestFinish: "participant" | "ro16" | "ro8" | "ro4" | "finalist" | "champion";
  country: string; // e.g. 'South Korea', 'Unknown'
}

export interface TournamentData {
  id: string;
  season: number;
  year: number;
  results: PlayerResult[];
  finished: boolean;
}
