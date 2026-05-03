# Clock Face Maker

A parametric clock face designer that outputs SVG files, with project management.
When any parameters are changed update the project immediatly.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 18 + Vite + Tailwind CSS |
| Persistence | localStorage via `src/lib/storage.ts` |
| SVG generation | Pure TS (src/lib/generateSvg.ts) |


## Project Structure
```text
clock_face_maker/
└── src/
    ├── lib/
    │   ├── storage.ts      # localStorage CRUD (projects, settings, snapshots)
    │   └── generateSvg.ts  # Clock SVG generation (pure TS)
    ├── hooks/
    │   ├── useProjects.ts  # Project CRUD
    │   └── useSettings.ts  # Persisted user settings (default font, last project)
    ├── components/
    │   ├── ProjectSidebar.tsx  # Left: create / list / switch projects
    │   ├── ParameterPanel.tsx  # Right: sliders, toggles, color pickers
    │   ├── FontPicker.tsx      # Font selection component
    │   └── SvgPreview.tsx      # Center: live SVG preview + download button
    └── pages/Home.tsx      # Composes layout, owns params state
```

## Development

### Local dev (with hot reload)

```sh
npm install
npm run dev       # http://localhost:5173
```

### Docker

```sh
docker compose up --build   # http://localhost:8080
docker compose up --build -d  # detached
docker compose down
```

## Key Parameters

| Parameter | Default | Description |
| --- | --- | --- |
| `diameter` | 300 | Face diameter in px (SVG canvas size) |
| `face_color` | #ffffff | Background fill |
| `border_color` | #000000 | Outer ring stroke |
| `border_width` | 4 | Outer ring stroke width |
| `mark_color` | #000000 | Hour/minute mark and number color |
| `hour_mark_length` | 18 | Hour tick length |
| `hour_mark_width` | 3 | Hour tick stroke width |
| `show_minute_marks` | true | Toggle 60-tick ring |
| `minute_mark_length` | 8 | Minute tick length |
| `minute_mark_width` | 1 | Minute tick stroke width |
| `show_numbers` | true | Toggle 1–12 numerals |
| `number_font` | Roboto | Font family for numerals |
| `number_size` | 20 | Numeral font size |
| `number_font_weight` | 400 | Numeral font weight |
| `number_font_italic` | false | Italic numerals |
| `number_roman` | false | Use Roman numerals |
| `number_mark_gap` | 16 | Gap between numeral and hour mark |
| `center_hole_diameter` | 8 | Center hole diameter |
| `cardinal_marks_only` | false | Show only 12/3/6/9 marks |

## Notes

-   **README.md Maintenance:** The `README.md` file should be kept up-to-date with any new features, changes, or updates to the application, ensuring it accurately reflects the current usage and features.
-   SVG is generated synchronously in the browser on every param change — no debounce or network call needed.
-   All data (projects, snapshots, settings) persisted in localStorage. No backend required.

## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- For cross-module "how does X relate to Y" questions, prefer `graphify query "<question>"`, `graphify path "<A>" "<B>"`, or `graphify explain "<concept>"` over grep — these traverse the graph's EXTRACTED + INFERRED edges instead of scanning files
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost)
