interface Player {
  name: string;
  liquipediaUrl?: string;
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

async function loadPlayers(): Promise<Player[]> {
  const res = await fetch("/players.json");
  return res.json();
}

function addSorting(table: HTMLTableElement, players: Player[]) {
  const headers = table.querySelectorAll("th[data-sort-key]");
  let currentSortKey: string | null = null;
  let ascending = true;

  headers.forEach((header) => {
    header.addEventListener("click", () => {
      const sortKey = header.getAttribute("data-sort-key")!;
      if (currentSortKey === sortKey) {
        ascending = !ascending; // toggle direction
      } else {
        currentSortKey = sortKey;
        ascending = true;
      }

      const sortedPlayers = [...players].sort((a, b) => {
        const valA = a[sortKey as keyof Player] as number;
        const valB = b[sortKey as keyof Player] as number;
        return ascending ? valA - valB : valB - valA;
      });

      // re-render tbody only
      const oldTbody = table.querySelector("tbody");
      if (oldTbody) table.removeChild(oldTbody);
      table.appendChild(renderTableBody(sortedPlayers));
    });
  });
}

function renderTableBody(players: Player[]) {
  const tbody = document.createElement("tbody");
  players.forEach((p) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><a href="${p.liquipediaUrl ?? "#"}" target="_blank">${p.name}</a></td>
      <td>${p.country ?? ""}</td>
      <td>${p.races.join(", ")}</td>
      <td>${p.participantCount}</td>
      <td>${p.ro16Count}</td>
      <td>${p.ro8Count}</td>
      <td>${p.ro4Count}</td>
      <td>${p.finalistCount}</td>
      <td>${p.championCount}</td>
      <td>${p.lastParticipation.season}/${p.lastParticipation.year}</td>
    `;
    tbody.appendChild(tr);
  });
  return tbody;
}

function renderTable(players: Player[]) {
  const app = document.getElementById("app")!;
  app.innerHTML = ""; // clear old content

  const table = document.createElement("table");
  table.innerHTML = `
    <thead>
      <tr>
        <th>Player</th>
        <th>Country</th>
        <th>Races</th>
        <th data-sort-key="participantCount" style="cursor:pointer">Participations ▲▼</th>
        <th data-sort-key="ro16Count" style="cursor:pointer">Ro16 ▲▼</th>
        <th data-sort-key="ro8Count" style="cursor:pointer">Ro8 ▲▼</th>
        <th data-sort-key="ro4Count" style="cursor:pointer">Ro4 ▲▼</th>
        <th data-sort-key="finalistCount" style="cursor:pointer">Finals ▲▼</th>
        <th data-sort-key="championCount" style="cursor:pointer">Wins ▲▼</th>
        <th>Last Participation</th>
      </tr>
    </thead>
  `;
  table.appendChild(renderTableBody(players));
  app.appendChild(table);

  addSorting(table, players);
}

(async () => {
  const players = await loadPlayers();
  renderTable(players);
})();
