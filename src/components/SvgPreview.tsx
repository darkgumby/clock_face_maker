import { useEffect, useMemo, useState } from "react";
import { useZoom } from "../hooks/useZoom";
import { type UnitPreference } from "../hooks/useSettings";

interface SvgPreviewProps {
  svgContent: string | null;
  onDownloadSvg: () => void;
  onDownloadPng: () => void;
  svgError: string | null;
  downloadingFont?: boolean;
  unitPreference?: UnitPreference;
  onHelp?: () => void;
}

export default function SvgPreview({ svgContent, onDownloadSvg, onDownloadPng, svgError, downloadingFont, unitPreference = "mm", onHelp }: SvgPreviewProps) {
  const { imgRef, scale, zoomIn, zoomOut, resetZoom } = useZoom();
  const [fontVersion, setFontVersion] = useState(0);

  useEffect(() => {
    const handler = () => setFontVersion((v) => v + 1);
    (document.fonts as EventTarget).addEventListener("loadingdone", handler);
    return () => (document.fonts as EventTarget).removeEventListener("loadingdone", handler);
  }, []);

  const displaySvg = useMemo(() => {
    return svgContent;
  }, [svgContent]);

  // Inject CSS sizing so inline SVG is constrained by its container instead of
  // rendering at physical mm dimensions (which can be huge on high-DPI screens).
  // fontVersion embedded as data attribute so React updates innerHTML in-place
  // (no remount) when fonts finish loading, repainting SVG text correctly.
  const inlineSvg = useMemo(() => {
    if (!displaySvg) return null;
    return displaySvg.replace(
      /<svg /,
      `<svg data-fv="${fontVersion}" style="max-width:100%;max-height:calc(100vh - 6rem);height:auto;" `
    );
  }, [displaySvg, fontVersion]);

  return (
    <div className="flex-1 flex flex-col items-stretch bg-gray-300 relative overflow-hidden">
      {/* Toolbar */}
      <div className="absolute top-4 right-4 z-10 flex gap-2 items-center">
        <div className="flex bg-gray-700 rounded overflow-hidden mr-2 shadow-lg">
          <button
            onClick={zoomOut}
            title="Zoom Out"
            className="px-2 py-1.5 hover:bg-gray-600 text-gray-200 transition-colors border-r border-gray-600"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M2 8a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 0 1h-11A.5.5 0 0 1 2 8Z"/>
            </svg>
          </button>
          <button
            onClick={resetZoom}
            title="Reset Zoom"
            className="px-2 py-1.5 hover:bg-gray-600 text-gray-200 text-[10px] font-medium transition-colors border-r border-gray-600 min-w-[48px]"
          >
            {Math.round(scale * 100)}%
          </button>
          <button
            onClick={zoomIn}
            title="Zoom In"
            className="px-2 py-1.5 hover:bg-gray-600 text-gray-200 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
              <path fillRule="evenodd" d="M8 2a.5.5 0 0 1 .5.5v5h5a.5.5 0 0 1 0 1h-5v5a.5.5 0 0 1-1 0v-5h-5a.5.5 0 0 1 0-1h5v-5A.5.5 0 0 1 8 2Z"/>
            </svg>
          </button>
        </div>

        <button
          onClick={onDownloadSvg}
          disabled={!svgContent || !!svgError || downloadingFont}
          className="px-3 py-1.5 text-xs rounded bg-gray-700 hover:bg-gray-600 text-gray-200 disabled:opacity-40 transition-colors shadow-lg"
        >
          {downloadingFont ? "Embedding font…" : "Export SVG"}
        </button>
        <button
          onClick={onDownloadPng}
          disabled={!svgContent || !!svgError || downloadingFont}
          className="px-3 py-1.5 text-xs rounded bg-gray-700 hover:bg-gray-600 text-gray-200 disabled:opacity-40 transition-colors shadow-lg"
        >
          {downloadingFont ? "Embedding font…" : "Export PNG"}
        </button>
        {onHelp && (
          <button
            onClick={onHelp}
            className="px-3 py-1.5 text-xs rounded bg-gray-700 hover:bg-gray-600 text-gray-200 transition-colors shadow-lg"
          >
            Help
          </button>
        )}
      </div>

      {/* Preview area */}
      <div
        ref={imgRef}
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
