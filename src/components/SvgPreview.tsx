import { useEffect, useMemo, useRef } from "react";
import { useZoom } from "../hooks/useZoomPan"; // Import the new hook

interface SvgPreviewProps {
  svgContent: string | null;
  onDownloadSvg: () => void;
  svgError: string | null; // Prop to receive SVG generation errors
}

export default function SvgPreview({ svgContent, onDownloadSvg, svgError }: SvgPreviewProps) {
  const { imgRef, scale } = useZoom(); // Use the zoom hook

  const blobUrl = useMemo(() => {
    if (!svgContent) return null;
    const blob = new Blob([svgContent], { type: "image/svg+xml" });
    return URL.createObjectURL(blob);
  }, [svgContent]);

  const prevUrl = useRef<string | null>(null);
  useEffect(() => {
    if (prevUrl.current) URL.revokeObjectURL(prevUrl.current);
    prevUrl.current = blobUrl;
  }, [blobUrl]);

  return (
    <div className="flex-1 flex flex-col items-stretch bg-gray-950 relative overflow-hidden">
      {/* Toolbar */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={onDownloadSvg}
          disabled={!svgContent || !!svgError} // Disable if no content or there's an error
          className="px-3 py-1.5 text-xs rounded bg-gray-700 hover:bg-gray-600 text-gray-200 disabled:opacity-40 transition-colors"
        >
          Download SVG
        </button>
      </div>

      {/* Preview area */}
      <div className="flex-1 flex items-center justify-center pt-12"
        style={{
          overflow: "hidden", // Ensure content outside current view is hidden
          position: "relative", // Needed for absolute positioning of the image
        }}
      >
        {svgError && (
          <div className="text-red-500 text-sm">{svgError}</div>
        )}
        {!svgError && !svgContent && (
          <div className="text-gray-600 text-sm">
            Select or create a project to see a preview.
          </div>
        )}
        {!svgError && svgContent && (
          <img
            ref={imgRef} // Attach ref from useZoom hook
            src={blobUrl || ''} // Ensure src is always a string
            alt="Clock face preview"
            className="p-8 drop-shadow-2xl"
            style={{
              maxWidth: "100%",
              maxHeight: "calc(100vh - 6rem)",
              transform: `scale(${scale})`, // Apply zoom only
              transformOrigin: 'center center', // Set transform origin to center for zoom
            }}
          />
        )}
      </div>
    </div>
  );
}
