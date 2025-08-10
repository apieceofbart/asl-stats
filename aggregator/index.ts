import fs from "fs";
import path from "path";
import type { TournamentData } from "../types";

interface PlayerStats {
  name: string;
  liquipediaUrl: string;
  country?: string;
  races: string[];
  participantCount: number;
  ro16Count: number;
  ro8Count: number;
  ro4Count: number;
  finalistCount: number;
  championCount: number;
  lastParticipation: { season: number; year: number };
}

const __dirname = path.resolve();

const tournamentsPath = path.join(__dirname, ".", "data", "tournaments.json");
const playersPath = path.join(__dirname, ".", "data", "players.json");

// Load tournaments
const tournaments: TournamentData[] = JSON.parse(
  fs.readFileSync(tournamentsPath, "utf8")
);

const playersMap: Record<string, PlayerStats> = {};

for (const tournament of tournaments) {
  for (const result of tournament.results) {
    const key = result.liquipediaUrl;
    if (!playersMap[key]) {
      playersMap[key] = {
        name: result.name,
        liquipediaUrl: result.liquipediaUrl,
        country: result.country,
        races: [...new Set(result.races)],
        participantCount: 0,
        ro16Count: 0,
        ro8Count: 0,
        ro4Count: 0,
        finalistCount: 0,
        championCount: 0,
        lastParticipation: { season: tournament.season, year: tournament.year },
      };
    }

    const player = playersMap[key];

    // Merge races
    player.races = [...new Set([...player.races, ...result.races])];

    // Increment counts
    player.participantCount++;
    switch (result.bestFinish) {
      case "ro16":
        player.ro16Count++;
        break;
      case "ro8":
        player.ro8Count++;
        break;
      case "ro4":
        player.ro4Count++;
        break;
      case "finalist":
        player.finalistCount++;
        break;
      case "champion":
        player.championCount++;
        break;
    }

    // Update last participation
    if (
      tournament.year > player.lastParticipation.year ||
      (tournament.year === player.lastParticipation.year &&
        tournament.season > player.lastParticipation.season)
    ) {
      player.lastParticipation = {
        season: tournament.season,
        year: tournament.year,
      };
    }
  }
}

// Save players.json
fs.writeFileSync(
  playersPath,
  JSON.stringify(Object.values(playersMap), null, 2),
  "utf8"
);

console.log(
  `Aggregated ${Object.keys(playersMap).length} players into ${playersPath}`
);
