import fs from "fs";
import path from "path";
// import * as cheerio from "cheerio";
import { parseTournament } from "./parseTournament.ts";
import type { Tournament, TournamentData } from "./types.ts";

const __dirname = path.resolve();
const urlsPath = path.join(__dirname, "..", "data", "urls.json");

async function scrapeTournament(
  tournament: Tournament
): Promise<TournamentData> {
  console.log(`Fetching: ${tournament.url}`);

  const res = await fetch(tournament.url, {
    headers: {
      "User-Agent": "ASL Stats Scraper - educational project",
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch ${tournament.url}: ${res.statusText}`);
  }
  const html = await res.text();

  const tournamentData = parseTournament(html, tournament);

  console.log(
    `Tournament ${tournament.id} parsed with ${tournamentData.results.length} players.`
  );

  return tournamentData;
}

async function main(): Promise<void> {
  const raw = fs.readFileSync(urlsPath, "utf-8");
  const urls: Tournament[] = JSON.parse(raw);

  const tournamentDataArray: TournamentData[] = [];

  for (const tournament of urls) {
    const tournamentData = await scrapeTournament(tournament);
    tournamentDataArray.push(tournamentData);
  }

  const tournamentPath = path.join(__dirname, "..", "data", "tournaments.json");

  fs.writeFileSync(
    tournamentPath,
    JSON.stringify(tournamentDataArray, null, 2),
    "utf8"
  );

  console.log("✅ Tournaments data saved to tournaments.json");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
