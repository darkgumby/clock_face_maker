# Clock Face Maker

A parametric clock face designer that outputs SVG files, with project management.

**Live app:** https://darkgumby.github.io/clock_face_maker/

## Features

- **Parametric Design:** Adjust diameter, colors, border, mark lengths, font, and number style.
- **Live SVG Preview:** Changes reflect instantly — no debounce, no network call.
- **Zoom:** Mouse wheel zoom on the clock preview.
- **Project Management:** Create and switch between multiple projects. Last selected project is remembered.
- **Snapshots:** Save and restore parameter states per project.
- **SVG Download:** Export your clock face as a production-ready SVG file.
- **No backend:** Everything runs in the browser. Data persists in localStorage — no login, no server.

## Parameters

- Face diameter (scales the whole SVG)
- Background and border color + border width
- Hour marks — length, width, style (line, circle, square, diamond), and color
- Minute marks — same options, or hide them entirely
- Cardinal-only mode (just 12/3/6/9 marks)
- Numbers — font, size, weight, italic, Roman numeral option, gap from marks
- Center hole diameter
- Mix and match hour vs. minute mark styles independently
- **Laser Mode** — overrides colors to LightBurn conventions: face fill red (engrave), marks/border black (cut), crosshair green (alignment)
- **Crosshair** — thin alignment lines through center for registration jigs and re-engraving

## SVG Output Quality

Downloaded SVGs are production-ready for laser, CNC, and design workflows:

- **Real-world units** — `width`/`height` on the SVG root match the chosen unit system (`mm` or `in`); `inkscape:document-units` is also set so Inkscape opens the file in the correct unit without rescaling. Tools like LightBurn and Fusion 360 also read the physical dimensions correctly.
- **Named layer groups** — elements wrapped in `<g id="face">`, `<g id="hour-marks">`, `<g id="minute-marks">`, `<g id="numbers">`, `<g id="center">`, `<g id="crosshair">` for easy per-layer operation assignment
- **Text as paths** — numbers are converted to vector paths at download time using the actual font geometry; no font dependency in the exported file
- **Font subsetting** — only the glyphs used on the face are fetched, keeping file size small; falls back to embedded font if path conversion fails
- **Embedded parameters** — a `<metadata>` block in every SVG stores the full parameter set as JSON for later reconstruction
- **`text-rendering="geometricPrecision"`** — sharp numeral rendering in SVG viewers and laser software previews

## Laser Mode Color Convention

| Color | Layer | Operation |
|-------|-------|-----------|
| Red `#ff0000` | `face` | Engrave / fill |
| Black `#000000` | `hour-marks`, `minute-marks`, `numbers`, `center`, border | Cut |
| Green `#00ff00` | `crosshair` | Alignment (ignore or cut lightly) |

Map these to operations in LightBurn, xTool Creative Space, or your software of choice.

## Use Cases

SVG scales to any size without losing quality — design at 300px, cut at 300mm, no rasterization artifacts.

- Laser-engraved wood, acrylic, leather, or slate clock faces
- 3D-printed clock bezels (export SVG → extrude in your CAD tool)
- CNC routing clock faces
- Vinyl cut clock overlays
- Waterjet / plasma cutting — metal, stone, or glass faces
- Die cutting (Cricut, Silhouette) — paper, cardstock, or felt clock faces
- Machine embroidery — SVG converts to stitch paths
- Screen printing / sublimation — clock graphics on shirts, posters, or merch
- Glass etching — chemical or sandblast, using the SVG as a mask template
- Resin casting — pour template or embed under clear resin
- Stencil making — spray paint or brush over a cut stencil
- Woodburning / pyrography — trace the SVG as a guide
- Inlay / marquetry — SVG defines cut lines for contrasting wood or material pieces
- Smartwatch / digital watch faces — SVG renders directly in many watch face tools
- CAD extrusion — import into Fusion 360 or FreeCAD and extrude a full bezel model
- PCB silkscreen — decorative clock face printed on a circuit board

## Coming Soon

Parametric clock hands — full control over hand length, width, style, color, and tip shape per hand (hour, minute, second). Option to include hands in the face SVG or export them as a separate SVG for cutting as individual pieces.

## License

Released into the public domain under [The Unlicense](LICENSE.md). Use it for anything — personal, commercial, or otherwise. No attribution required.

Forks and PRs welcome.

## Tech Stack

- **Frontend:** React (TypeScript) + Vite + Tailwind CSS
- **Persistence:** localStorage — no backend, no server required
- **SVG Generation:** Pure TypeScript in the browser
- **Text-to-path:** opentype.js (download-time conversion)

## Getting Started

### Local dev

```bash
npm install
npm run dev   # http://localhost:5173
```

### Docker

```bash
docker compose up --build   # http://localhost:8080
```
