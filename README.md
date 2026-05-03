# Clock Face Maker

A parametric clock face designer that outputs SVG files, with project management.

**Live app:** https://darkgumby.github.io/clock_face_maker/

## Features

- **Parametric Design:** Adjust diameter, colors, border, mark lengths, font, and number style.
- **Live SVG Preview:** Changes reflect instantly — no debounce, no network call.
- **Zoom:** Mouse wheel zoom on the clock preview.
- **Project Management:** Create and switch between multiple projects. Last selected project is remembered.
- **Snapshots:** Save and restore parameter states per project.
- **SVG Download:** Export your clock face as an SVG file.
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
