import opentype from "opentype.js";
import { GOOGLE_FONTS } from "../components/FontPicker";

async function fetchOpentypeFont(
  fontFamily: string,
  weight: number,
  italic: boolean,
  chars: string
): Promise<opentype.Font | null> {
  try {
    const style = italic ? "1" : "0";
    const cssUrl = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontFamily)}:ital,wght@${style},${weight}&text=${encodeURIComponent(chars)}`;
    const css = await fetch(cssUrl).then((r) => r.text());
    // Pick the first (usually only) font file URL — subsetted CSS has one per block
    const match = css.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/);
    if (!match) return null;
    const buffer = await fetch(match[1]).then((r) => r.arrayBuffer());
    return opentype.parse(buffer);
  } catch {
    return null;
  }
}

export async function convertTextToPaths(
  svg: string,
  fontFamily: string,
  weight: number,
  italic: boolean,
  chars: string
): Promise<string> {
  if (!GOOGLE_FONTS.includes(fontFamily)) return svg;

  const font = await fetchOpentypeFont(fontFamily, weight, italic, chars);
  if (!font) return svg;

  const parser = new DOMParser();
  const doc = parser.parseFromString(svg, "image/svg+xml");
  const textEls = Array.from(doc.querySelectorAll("text"));

  for (const textEl of textEls) {
    const x = parseFloat(textEl.getAttribute("x") || "0");
    const y = parseFloat(textEl.getAttribute("y") || "0");
    const fill = textEl.getAttribute("fill") || "#000000";
    const fontSize = parseFloat(
      (textEl.getAttribute("font-size") || "20px").replace("px", "")
    );
    const content = textEl.textContent || "";
    if (!content) continue;

    // Measure at origin to get bounding box for centering
    const measuredPath = font.getPath(content, 0, 0, fontSize);
    const bbox = measuredPath.getBoundingBox();
    const dx = x - (bbox.x1 + bbox.x2) / 2;
    const dy = y - (bbox.y1 + bbox.y2) / 2;

    const pathData = font.getPath(content, dx, dy, fontSize).toPathData(2);

    const pathEl = doc.createElementNS("http://www.w3.org/2000/svg", "path");
    pathEl.setAttribute("d", pathData);
    pathEl.setAttribute("fill", fill);

    textEl.parentNode?.replaceChild(pathEl, textEl);
  }

  return new XMLSerializer().serializeToString(doc);
}

export function getRequiredChars(roman: boolean, cardinalOnly: boolean): string {
  if (roman) return "IVX";
  if (cardinalOnly) return "12369";
  return "0123456789";
}
