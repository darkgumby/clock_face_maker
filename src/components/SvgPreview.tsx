import { useMemo, useState } from "react";
import { useZoom } from "../hooks/useZoom";
import { type UnitPreference } from "../hooks/useSettings";

const MM_PER_INCH = 25.4;

interface SvgPreviewProps {
  svgContent: string | null;
  onDownloadSvg: () => void;
  svgError: string | null;
  downloadingFont?: boolean;
  unitPreference?: UnitPreference;
}

function buildGridSvg(svg: string, unit: UnitPreference = "mm"): string {
  const wMatch = svg.match(/width="([\d.]+)mm"/);
  const hMatch = svg.match(/height="([\d.]+)mm"/);
  if (!wMatch || !hMatch) return svg;

  const w = parseFloat(wMatch[1]);
  const h = parseFloat(hMatch[1]);
  const maxDim = Math.max(w, h);

  // Pick a nice interval in the display unit, store in mm for SVG coords
  let intervalMm: number;
  let intervalDisplay: number;
  if (unit === "in") {
    const maxIn = maxDim / MM_PER_INCH;
    intervalDisplay = maxIn <= 3 ? 0.25 : maxIn <= 6 ? 0.5 : maxIn <= 12 ? 1 : 2;
    intervalMm = intervalDisplay * MM_PER_INCH;
  } else {
    intervalMm = maxDim <= 80 ? 5 : maxDim <= 150 ? 10 : maxDim <= 300 ? 25 : 50;
    intervalDisplay = intervalMm;
  }

  // Extend 2 intervals beyond each edge so the clock sits inside the grid
  const pad = intervalMm * 2;
  const totalW = w + pad * 2;
  const totalH = h + pad * 2;

  const sc = "#1e40af"; // blue-800
  const fs = Math.max(3, intervalMm * 0.28);
  const lines: string[] = [];

  const xStart = Math.ceil(-pad / intervalMm) * intervalMm;
  for (let x = xStart; x <= w + pad + 0.001; x += intervalMm) {
    const xRound = Math.round(x * 1000) / 1000;
    const displayVal = unit === "in"
      ? (xRound / MM_PER_INCH / intervalDisplay * intervalDisplay).toFixed(xRound % MM_PER_INCH === 0 ? 0 : 2)
      : String(Math.round(xRound));
    lines.push(`<line x1="${xRound}" y1="${-pad}" x2="${xRound}" y2="${h + pad}" stroke="${sc}" stroke-width="0.4" stroke-dasharray="2,3"/>`);
    lines.push(`<text x="${xRound}" y="${-pad + fs + 1}" font-size="${fs}" fill="${sc}" text-anchor="middle" font-family="monospace">${displayVal}</text>`);
  }
  const yStart = Math.ceil(-pad / intervalMm) * intervalMm;
  for (let y = yStart; y <= h + pad + 0.001; y += intervalMm) {
    const yRound = Math.round(y * 1000) / 1000;
    const displayVal = unit === "in"
      ? (yRound / MM_PER_INCH / intervalDisplay * intervalDisplay).toFixed(yRound % MM_PER_INCH === 0 ? 0 : 2)
      : String(Math.round(yRound));
    lines.push(`<line x1="${-pad}" y1="${yRound}" x2="${w + pad}" y2="${yRound}" stroke="${sc}" stroke-width="0.4" stroke-dasharray="2,3"/>`);
    lines.push(`<text x="${-pad + 1}" y="${yRound}" font-size="${fs}" fill="${sc}" dominant-baseline="middle" font-family="monospace">${displayVal}</text>`);
  }

  const gridGroup = `<g id="preview-grid" opacity="0.65">\n${lines.join("\n")}\n</g>`;

  // Expand the SVG canvas to include padding, insert grid behind everything
  return svg
    .replace(/width="[\d.]+mm"/, `width="${totalW}mm"`)
    .replace(/height="[\d.]+mm"/, `height="${totalH}mm"`)
    .replace(/viewBox="[^"]*"/, `viewBox="${-pad} ${-pad} ${totalW} ${totalH}"`)
    .replace(/(<svg[^>]*>)/, `$1\n${gridGroup}`);
}

export default function SvgPreview({ svgContent, onDownloadSvg, svgError, downloadingFont, unitPreference = "mm" }: SvgPreviewProps) {
  const { imgRef, scale } = useZoom();
  const [showGrid, setShowGrid] = useState(false);

  const displaySvg = useMemo(() => {
    if (!svgContent) return null;
    return showGrid ? buildGridSvg(svgContent, unitPreference) : svgContent;
  }, [svgContent, showGrid, unitPreference]);

  // Inject CSS sizing so inline SVG is constrained by its container instead of
  // rendering at physical mm dimensions (which can be huge on high-DPI screens).
  const inlineSvg = useMemo(() => {
    if (!displaySvg) return null;
    return displaySvg.replace(
      /<svg /,
      '<svg style="max-width:100%;max-height:calc(100vh - 6rem);height:auto;" '
    );
  }, [displaySvg]);

  return (
    <div className="flex-1 flex flex-col items-stretch bg-gray-300 relative overflow-hidden">
      {/* Toolbar */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={() => setShowGrid((v) => !v)}
          disabled={!svgContent || !!svgError}
          className={`px-3 py-1.5 text-xs rounded transition-colors disabled:opacity-40 ${
            showGrid
              ? "bg-blue-600 hover:bg-blue-500 text-white"
              : "bg-gray-700 hover:bg-gray-600 text-gray-200"
          }`}
        >
          Grid
        </button>
        <button
          onClick={onDownloadSvg}
          disabled={!svgContent || !!svgError || downloadingFont}
          className="px-3 py-1.5 text-xs rounded bg-gray-700 hover:bg-gray-600 text-gray-200 disabled:opacity-40 transition-colors"
        >
          {downloadingFont ? "Embedding font…" : "Download SVG"}
        </button>
      </div>

      {/* Preview area */}
      <div
        className="flex-1 flex items-center justify-center pt-12"
        style={{ overflow: "hidden", position: "relative" }}
      >
        {svgError && <div className="text-red-500 text-sm">{svgError}</div>}
        {!svgError && !svgContent && (
          <div className="text-gray-600 text-sm">
            Select or create a project to see a preview.
          </div>
        )}
        {!svgError && svgContent && (
          <div
            ref={imgRef}
            className="p-8 drop-shadow-2xl"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: "center center",
            }}
            dangerouslySetInnerHTML={{ __html: inlineSvg || "" }}
          />
        )}
      </div>
    </div>
  );
}
