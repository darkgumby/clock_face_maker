import { GOOGLE_FONTS } from "../components/FontPicker";

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  const chunk = 8192;
  for (let i = 0; i < bytes.length; i += chunk) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunk));
  }
  return btoa(binary);
}

export async function embedGoogleFont(
  svg: string,
  fontFamily: string,
  weight: number,
  italic: boolean,
  chars?: string
): Promise<string> {
  if (!GOOGLE_FONTS.includes(fontFamily)) return svg;

  try {
    const style = italic ? "1" : "0";
    const textParam = chars ? `&text=${encodeURIComponent(chars)}` : "";
    const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:ital,wght@${style},${weight}${textParam}`;
    const cssResp = await fetch(cssUrl);
    if (!cssResp.ok) return svg;
    const css = await cssResp.text();

    // Collect all font file URLs from the CSS
    const urlRe = /url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g;
    const fontUrls: string[] = [];
    let m: RegExpExecArray | null;
    while ((m = urlRe.exec(css)) !== null) fontUrls.push(m[1]);

    // Fetch and base64 encode each font file
    let embeddedCss = css;
    await Promise.all(
      fontUrls.map(async (fontUrl) => {
        const resp = await fetch(fontUrl);
        if (!resp.ok) return;
        const b64 = arrayBufferToBase64(await resp.arrayBuffer());
        const fmt = fontUrl.includes(".woff2") ? "woff2" : "woff";
        embeddedCss = embeddedCss.replace(fontUrl, `data:font/${fmt};base64,${b64}`);
      })
    );

    return svg.replace(/(<svg[^>]*>)/, `$1\n<style>\n${embeddedCss}\n</style>`);
  } catch {
    return svg;
  }
}
