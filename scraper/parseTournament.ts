import * as cheerio from "cheerio";
import type { PlayerResult, TournamentData } from "../types.ts";
import { assert } from "console";

function normalizePlayerName(name: string) {
  return name.trim().toLowerCase();
}

export function parseTournament(
  html: string,
  metadata: {
    id: string;
    season: number;
    year: number;
    finished: boolean;
    url: string;
  }
): TournamentData {
  const $ = cheerio.load(html);

  const playerMap = new Map<string, PlayerResult>();
  let players = $(
    "table.wikitable.wikitable-bordered.grouptable .inline-player"
  );

  // starting from ASL11 html changed
  if (players.length === 0) {
    players = $(".group-table-results .inline-player");
  }

  players.each((_, element) => {
    const player = $(element);

    // For example, get the player's name (usually the text inside)
    let name = player.text().trim();

    if (player.find("sup").length) {
      // if there's footnote remove last character from player name
      name = name.slice(0, -1);
    }

    const normalizedName = normalizePlayerName(name);

    // Get the Liquipedia URL if it's a link inside the element
    let link = player.find("a").attr("href");

    // handle "Shuttle" case - in one tournament the link to shuttle profile is wrong
    // since we're using link as a unique key we need to fix this otherwise we'll have 2 entries for shuttle
    if (link === "/starcraft/Shuttle") {
      link = "/starcraft/Shuttle_(Player)";
    }
    const liquipediaUrl = `https://liquipedia.net${link}`;

    // Extract country from the flag image's alt attribute
    const country = player.find("span.flag img").attr("alt") || "Unknown";

    // Extract race from the small icon image's alt attribute (assuming only one per player)
    // The race icon is the first img inside .inline-player but outside .flag
    // So we find all imgs and exclude the one inside flag, or just find img not inside .flag
    let races: string[] = [];
    player.find("img").each((_, img) => {
      const imgElem = $(img);
      // Check if img is inside the flag span
      if (!imgElem.parents("span.flag").length) {
        // This is the race icon
        const alt = imgElem.attr("alt");
        if (alt) races.push(alt);
      }
    });

    const defaultBestFinish: PlayerResult["bestFinish"] =
      metadata.season === 1 ? "ro16" : "participant"; // ASL1 had only 16 participants so they all go to ro16 automatically

    if (!playerMap.has(normalizedName) && name !== "TBD") {
      playerMap.set(normalizedName, {
        name,
        liquipediaUrl,
        races,
        country,
        bestFinish: defaultBestFinish,
      });
    }
  });

  if (metadata.finished) {
    const roundOf16Selector = "Round_of_16_Group_Stage";
    const roundOf16Selector2 = "Round_of_16";

    let roundOf16Container = $(`h3 > span#${roundOf16Selector}`)
      .parent()
      .nextAll("div")
      .first();

    if (roundOf16Container.length === 0) {
      roundOf16Container = $(`h3 > span#${roundOf16Selector2}`)
        .parent()
        .nextAll("div")
        .first();
    }

    if (roundOf16Container.length !== 0) {
      const playersInRoundOf16 = roundOf16Container.find(".inline-player");

      const playerNamesInRoundOf16 = new Set<string>();
      playersInRoundOf16.each((_, el) => {
        const playerName = $(el).text().trim();
        if (playerName) {
          playerNamesInRoundOf16.add(normalizePlayerName(playerName));
        }
      });

      playerMap.forEach((player) => {
        if (playerNamesInRoundOf16.has(normalizePlayerName(player.name))) {
          player.bestFinish = "ro16";
        }
      });
    }

    const bracketPlayers = $(
      ".brkts-bracket .brkts-opponent-entry .block-players-wrapper"
    ).filter(function () {
      // Exclude third place match
      return $(this).closest(".brkts-third-place-match").length === 0;
    });

    const playerOccurrenceInEliminationBracket = new Map<string, number>();

    bracketPlayers.each((index, element) => {
      const player = $(element);
      const name = normalizePlayerName(player.text().trim());

      // Count occurrences of each player in the bracket
      playerOccurrenceInEliminationBracket.set(
        name,
        (playerOccurrenceInEliminationBracket.get(name) || 0) + 1
      );
    });

    const occurrencesToBestFinish: Record<number, PlayerResult["bestFinish"]> =
      {
        1: "ro8",
        2: "ro4",
        3: "finalist",
      };

    playerMap.forEach((result, name) => {
      if (playerOccurrenceInEliminationBracket.has(name)) {
        result.bestFinish =
          occurrencesToBestFinish[
            playerOccurrenceInEliminationBracket.get(name)!
          ];
      }
    });

    // get the winner
    const winner = $(".prizepooltable .block-players-wrapper")
      .first()
      .text()
      .trim();

    const normalizedWinner = normalizePlayerName(winner);

    playerMap.set(normalizedWinner, {
      ...playerMap.get(normalizedWinner)!,
      bestFinish: "champion",
    });

    const playerValues = Array.from(playerMap.values());

    for (const player of playerValues) {
      assert(
        player.races.length > 0,
        `Expected races for player ${player.name}`
      );
    }

    const countRo16 = playerValues.filter(
      (p) => p.bestFinish === "ro16"
    ).length;
    assert(
      countRo16 === 8,
      `Expected 16 players in Ro16, but got ${countRo16}`
    );

    const countRo8 = playerValues.filter((p) => p.bestFinish === "ro8").length;

    assert(countRo8 === 4, `Expected 8 players in Ro8, but got ${countRo8}`);

    const countRo4 = playerValues.filter((p) => p.bestFinish === "ro4").length;
    assert(countRo4 === 2, `Expected 4 players in Ro4, but got ${countRo4}`);

    const countFinalists = playerValues.filter(
      (p) => p.bestFinish === "finalist"
    ).length;
    assert(
      countFinalists === 1,
      `Expected 1 finalist, but got ${countFinalists}`
    );

    const countChampions = playerValues.filter(
      (p) => p.bestFinish === "champion"
    ).length;
    assert(
      countChampions === 1,
      `Expected 1 champion, but got ${countChampions}`
    );
  }

  return {
    id: metadata.id,
    season: metadata.season,
    url: metadata.url,
    year: metadata.year,
    finished: metadata.finished,
    results: Array.from(playerMap.values()),
  };
}
