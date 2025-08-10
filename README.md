# ASL Brood War Tournament Stats

A project to scrape, aggregate, and display player results from all Afreeca Starleague (ASL) Brood War tournaments. The goal is to provide an easy-to-navigate, sortable summary of player achievements across seasons, complete with race info and links to Liquipedia profiles.

---

## Features

- **Scraper** to fetch tournament data from Liquipedia
- Consolidation of player info including aliases and multiple races
- Aggregated stats: participations, round finishes, wins, etc.
- Static website showing a sortable, filterable table of all-time player results
- Easy to update with new tournaments or detailed match data in the future

---

## Repo Structure

```
asl-stats/
│
├── data/ # JSON data files (players, tournaments, URLs)
│
├── scraper/ # Node.js scripts to scrape and parse Liquipedia data
│
├── site/ # Static website source files (HTML, CSS, JS)
│
└── README.md # This file
```

---

## Getting Started

### Prerequisites

- Node.js (v22 or newer recommended)
- npm (comes with Node.js)

### Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/yourusername/asl-stats.git
   cd asl-stats/scraper
   ```

2. Install dependencies:
   ```bash
   npm install
   ```
3. Add or update data/urls.json with ASL tournament URLs (already partially populated).

4. Run the scraper for the first tournament:
   ```bash
   npm start
   ```

This will fetch and print the page title as a test. Parsing logic will be added later.

---

## How It Works

- **Scraper** reads the list of ASL URLs, downloads tournament pages, and extracts player results.
- **Data** is saved in JSON files for players and tournaments, including race info and best finishes.
- The **static site** loads these JSON files and renders a sortable table showing all-time player stats.

---

## Future Plans

- Expand scraper to fully parse player results, including multi-race tracking.
- Implement aggregation scripts to build summary stats for the site.
- Add search and advanced filtering to the static website.
- Support detailed tournament pages and match-level data.

---

## Contributing

Contributions welcome! Please open issues or pull requests for bug fixes, new features, or improvements.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
