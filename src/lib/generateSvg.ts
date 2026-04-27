const ROMAN = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"];

export type FaceShape = "circle" | "square" | "rounded_square";
export type MarkPlacement = "radial" | "perimeter";

function squareEdgeIntersect(cx: number, cy: number, h: number, angle: number): [number, number] {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const tx = Math.abs(cos) > 1e-10 ? h / Math.abs(cos) : Infinity;
  const ty = Math.abs(sin) > 1e-10 ? h / Math.abs(sin) : Infinity;
  const t = Math.min(tx, ty);
  return [cx + t * cos, cy + t * sin];
}

interface SvgParams {
  diameter?: number;
  face_shape?: FaceShape;
  corner_radius?: number;
  face_color?: string;
  border_color?: string;
  border_width?: number;
  mark_color?: string;
  hour_mark_length?: number;
  hour_mark_width?: number;
  show_minute_marks?: boolean;
  minute_mark_length?: number;
  minute_mark_width?: number;
  show_numbers?: boolean;
  number_font?: string;
  number_size?: number;
  number_font_weight?: number;
  number_font_italic?: boolean;
  number_roman?: boolean;
  number_mark_gap?: number;
  center_hole_diameter?: number;
  cardinal_marks_only?: boolean;
  mark_placement?: MarkPlacement;
  mark_border_gap?: number;
}

export function generateSvg(params: SvgParams): string {
  const diameter = params.diameter ?? 300;
  const radius = diameter / 2;
  const cx = radius, cy = radius;

  const faceShape = params.face_shape ?? "circle";
  const cornerRadius = params.corner_radius ?? 20;
  const faceColor = params.face_color ?? "#ffffff";
  const borderColor = params.border_color ?? "#000000";
  const borderWidth = params.border_width ?? 4;
  const markColor = params.mark_color ?? "#000000";

  const hourMarkLength = params.hour_mark_length ?? 18;
  const hourMarkWidth = params.hour_mark_width ?? 3;

  const showMinuteMarks = params.show_minute_marks ?? true;
  const minuteMarkLength = params.minute_mark_length ?? 8;
  const minuteMarkWidth = params.minute_mark_width ?? 1;

  const showNumbers = params.show_numbers ?? true;
  const numberFont = params.number_font ?? "Arial";
  const numberSize = params.number_size ?? 20;
  const numberFontWeight = params.number_font_weight ?? 400;
  const numberFontItalic = params.number_font_italic ?? false;
  const numberRoman = params.number_roman ?? false;
  const numberMarkGap = params.number_mark_gap ?? 16;
  const centerHoleDiameter = params.center_hole_diameter ?? 8;
  const cardinalMarksOnly = params.cardinal_marks_only ?? false;
  const markPlacement = params.mark_placement ?? "radial";
  const usePerimeter = markPlacement === "perimeter" && faceShape !== "circle";
  const markBorderGap = params.mark_border_gap ?? 0;

  const innerRadius = radius - borderWidth;
  const markOuterRadius = innerRadius - markBorderGap;

  const minNumRadius = centerHoleDiameter / 2 + numberSize / 2 + 4;
  // Only auto-shrink marks when gap is positive (user-set gap is honored; negatives allow overlap)
  const effectiveHourMarkLength = showNumbers && numberMarkGap >= 0
    ? Math.max(1, Math.min(hourMarkLength, markOuterRadius - minNumRadius - numberMarkGap))
    : hourMarkLength;
  const numRadius = markOuterRadius - effectiveHourMarkLength - numberMarkGap;

  const els: string[] = [];

  if (faceShape === "circle") {
    els.push(
      `<circle cx="${cx}" cy="${cy}" r="${radius - borderWidth / 2}" fill="${faceColor}" stroke="${borderColor}" stroke-width="${borderWidth}"/>`
    );
  } else {
    const rx = faceShape === "rounded_square" ? cornerRadius : 0;
    const inset = borderWidth / 2;
    els.push(
      `<rect x="${inset}" y="${inset}" width="${diameter - borderWidth}" height="${diameter - borderWidth}" rx="${rx}" ry="${rx}" fill="${faceColor}" stroke="${borderColor}" stroke-width="${borderWidth}"/>`
    );
  }

  if (showMinuteMarks) {
    const effectiveMinuteMarkLength = Math.min(minuteMarkLength, Math.max(1, effectiveHourMarkLength - 2));
    for (let i = 0; i < 60; i++) {
      if (i % 5 === 0) continue;
      const a = ((i * 6 - 90) * Math.PI) / 180;
      const ca = Math.cos(a), sa = Math.sin(a);
      let x1: number, y1: number;
      if (usePerimeter) {
        [x1, y1] = squareEdgeIntersect(cx, cy, innerRadius, a);
        x1 -= markBorderGap * ca;
        y1 -= markBorderGap * sa;
      } else {
        x1 = cx + markOuterRadius * ca;
        y1 = cy + markOuterRadius * sa;
      }
      els.push(
        `<line x1="${x1}" y1="${y1}" x2="${x1 - effectiveMinuteMarkLength * ca}" y2="${y1 - effectiveMinuteMarkLength * sa}" stroke="${markColor}" stroke-width="${minuteMarkWidth}" stroke-linecap="round"/>`
      );
    }
  }

  for (let i = 0; i < 12; i++) {
    if (cardinalMarksOnly && i % 3 !== 0) continue;
    const a = ((i * 30 - 90) * Math.PI) / 180;
    const ca = Math.cos(a), sa = Math.sin(a);
    let x1: number, y1: number;
    if (usePerimeter) {
      [x1, y1] = squareEdgeIntersect(cx, cy, innerRadius, a);
      x1 -= markBorderGap * ca;
      y1 -= markBorderGap * sa;
    } else {
      x1 = cx + markOuterRadius * ca;
      y1 = cy + markOuterRadius * sa;
    }
    els.push(
      `<line x1="${x1}" y1="${y1}" x2="${x1 - effectiveHourMarkLength * ca}" y2="${y1 - effectiveHourMarkLength * sa}" stroke="${markColor}" stroke-width="${hourMarkWidth}" stroke-linecap="round"/>`
    );
  }

  if (showNumbers) {
    for (let i = 1; i <= 12; i++) {

      const a = ((i * 30 - 90) * Math.PI) / 180;
      const label = numberRoman ? ROMAN[i - 1] : String(i);
      els.push(
        `<text x="${cx + numRadius * Math.cos(a)}" y="${cy + numRadius * Math.sin(a)}" text-anchor="middle" dominant-baseline="central" font-family="${numberFont}" font-size="${numberSize}px" font-weight="${numberFontWeight}" font-style="${numberFontItalic ? "italic" : "normal"}" fill="${markColor}">${label}</text>`
      );
    }
  }

  els.push(
    `<circle cx="${cx}" cy="${cy}" r="${centerHoleDiameter / 2}" fill="#000000"/>`
  );

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${diameter}px" height="${diameter}px" viewBox="0 0 ${diameter} ${diameter}">\n${els.join("\n")}\n</svg>`;
}
