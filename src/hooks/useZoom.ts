import { useState, useRef, useCallback, useEffect } from "react";

interface ZoomState {
  scale: number;
}

interface UseZoomProps {
  initialScale?: number;
  minScale?: number;
  maxScale?: number;
  zoomSpeed?: number;
}

export const useZoom = ({
  initialScale = 2,
  minScale = 0.1,
  maxScale = 10,
  zoomSpeed = 0.001,
}: UseZoomProps = {}) => {
  const [state, setState] = useState<ZoomState>({
    scale: initialScale,
  });
  const imgRef = useRef<HTMLDivElement>(null);

  const handleWheel = useCallback((event: WheelEvent) => {
    event.preventDefault();

    const scaleAmount = event.deltaY * -zoomSpeed;
    const newScale = Math.max(minScale, Math.min(maxScale, state.scale * (1 + scaleAmount)));

    if (newScale === state.scale) return;

    setState({ scale: newScale });
  }, [state.scale, minScale, maxScale, zoomSpeed]);

  const zoomIn = useCallback(() => {
    setState(s => ({ scale: Math.min(maxScale, s.scale * 1.2) }));
  }, [maxScale]);

  const zoomOut = useCallback(() => {
    setState(s => ({ scale: Math.max(minScale, s.scale / 1.2) }));
  }, [minScale]);

  const resetZoom = useCallback(() => {
    setState({ scale: initialScale });
  }, [initialScale]);

  useEffect(() => {
    const imgElement = imgRef.current;
    if (imgElement) {
      (imgElement as HTMLElement).addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      if (imgElement) {
        (imgElement as HTMLElement).removeEventListener("wheel", handleWheel);
      }
    };
  }, [handleWheel]);

  return { imgRef, scale: state.scale, zoomIn, zoomOut, resetZoom };
};