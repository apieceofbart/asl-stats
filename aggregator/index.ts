import fs from "fs";
import path from "path";
import type { TournamentData } from "../types";
import { assert } from "console";

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

    const stages = [
      "participant",
      "ro16",
      "ro8",
      "ro4",
      "finalist",
      "champion",
    ];
    const finishIndex = stages.indexOf(result.bestFinish);
    if (finishIndex === -1) {
      // unknown bestFinish, fallback to participant only or skip
      player.participantCount++;
    } else {
      for (let i = 0; i <= finishIndex; i++) {
        const stage = stages[i];
        const countKey = stage + "Count"; // e.g. ro16Count
        // Defensive check, but these keys should exist
        if (countKey in player) {
          // @ts-ignore
          player[countKey]++;
        }
      }
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

// check for duplicate players by name
const duplicatePlayers = Object.values(playersMap).filter(
  (player, index, self) =>
    self.findIndex((p) => p.name === player.name) !== index
);

assert(
  duplicatePlayers.length === 0,
  `Duplicated players found: ${duplicatePlayers.map((p) => p.name).join(", ")}`
);

// Rename some of the players
playersMap["https://liquipedia.net/starcraft/RoyaL"].name = "RoyaL";

// Save players.json
fs.writeFileSync(
  playersPath,
  JSON.stringify(Object.values(playersMap), null, 2),
  "utf8"
);

console.log(
  `Aggregated ${Object.keys(playersMap).length} players into ${playersPath}`
);
