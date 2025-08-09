import fs from "fs";
import path from "path";
// import * as cheerio from "cheerio";
import { parseTournament } from "./parseTournament.ts";

interface Tournament {
  id: string;
  season: number;
  year: number;
  url: string;
}

const __dirname = path.resolve();
const urlsPath = path.join(__dirname, "..", "data", "urls.json");

async function scrapeTournament(tournament: Tournament): Promise<void> {
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

  // TODO: Save to data/tournaments.json etc.

  // TODO: parseTournament logic here or import from parseTournament.ts
}

async function main(): Promise<void> {
  const raw = fs.readFileSync(urlsPath, "utf-8");
  const urls: Tournament[] = JSON.parse(raw);

  for (const tournament of urls) {
    await scrapeTournament(tournament);
    // break; // For now only first tournament
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
