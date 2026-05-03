export async function svgToPng(svgString: string, widthMm: number, heightMm: number, fileName: string): Promise<void> {
  const DPI = 300;
  const MM_PER_INCH = 25.4;
  const widthPx = Math.round((widthMm / MM_PER_INCH) * DPI);
  const heightPx = Math.round((heightMm / MM_PER_INCH) * DPI);

  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    canvas.width = widthPx;
    canvas.height = heightPx;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      reject(new Error("Could not get canvas context"));
      return;
    }

    const img = new Image();
    const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      // Clear canvas with transparency (default) or white background if needed
      ctx.clearRect(0, 0, widthPx, heightPx);
      ctx.drawImage(img, 0, 0, widthPx, heightPx);

      canvas.toBlob((blob) => {
        if (blob) {
          const pngUrl = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = pngUrl;
          a.download = fileName.endsWith(".png") ? fileName : `${fileName}.png`;
          a.click();
          URL.revokeObjectURL(pngUrl);
          URL.revokeObjectURL(url);
          resolve();
        } else {
          reject(new Error("Canvas toBlob failed"));
        }
      }, "image/png");
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };

    img.src = url;
  });
}
