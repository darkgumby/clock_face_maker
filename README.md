# Clock Face Maker

A parametric clock face designer that outputs SVG files, with project management.

## Features

- **Parametric Design:** Adjust diameter, colors, border, mark lengths, font, and number style.
- **Live SVG Preview:** Changes reflect instantly — no debounce, no network call.
- **Zoom/Pan:** Mouse wheel zoom on the clock preview.
- **Project Management:** Create and switch between multiple projects. Last selected project is remembered.
- **Snapshots:** Save and restore parameter states per project.
- **SVG Download:** Export your clock face as an SVG file.

## Tech Stack

- **Frontend:** React (TypeScript) + Vite + Tailwind CSS
- **Persistence:** localStorage — no backend, no server required
- **SVG Generation:** Pure TypeScript in the browser

## Getting Started

```bash
npm install
npm run dev   # http://localhost:5173
```


