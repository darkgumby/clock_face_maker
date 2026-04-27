const ROMAN = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"];

export type FaceShape = "circle" | "square" | "rounded_square";
export type MarkStyle = "line" | "circle";
function squareEdgeIntersect(cx: number, cy: number, h: number, r: number, angle: number): [number, number] {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const tx = Math.abs(cos) > 1e-10 ? h / Math.abs(cos) : Infinity;
  const ty = Math.abs(sin) > 1e-10 ? h / Math.abs(sin) : Infinity;

  if (r <= 0) {
    return [cx + Math.min(tx, ty) * cos, cy + Math.min(tx, ty) * sin];
  }

  // Check if flat-edge intersection lands in the flat portion (not corner zone)
  if (tx <= ty) {
    const y = sin * tx;
    if (Math.abs(y) <= h - r) return [cx + cos * tx, cy + sin * tx];
  } else {
    const x = cos * ty;
    if (Math.abs(x) <= h - r) return [cx + cos * ty, cy + sin * ty];
  }

  // Corner arc intersection
  const acx = cx + Math.sign(cos) * (h - r);
  const acy = cy + Math.sign(sin) * (h - r);
  const dx = cx - acx, dy = cy - acy;
  const b = 2 * (dx * cos + dy * sin);
  const c = dx * dx + dy * dy - r * r;
  const disc = b * b - 4 * c;
  const t = (-b + Math.sqrt(Math.max(0, disc))) / 2;
  return [cx + cos * t, cy + sin * t];
}

interface SvgParams {
  diameter?: number;
  face_width?: number;
  face_height?: number;
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
  cardinal_numbers_only?: boolean;
  mark_border_gap?: number;
  mark_round_ends?: boolean;
  mark_style?: MarkStyle;
  mark_circle_diameter?: number;
}

export function generateSvg(params: SvgParams): string {
  const faceShape = params.face_shape ?? "circle";
  const diameter = params.diameter ?? 300;
  const svgWidth = faceShape === "circle" ? diameter : (params.face_width ?? diameter);
  const svgHeight = faceShape === "circle" ? diameter : (params.face_height ?? diameter);
  const cx = svgWidth / 2, cy = svgHeight / 2;

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
  const cardinalNumbersOnly = params.cardinal_numbers_only ?? false;
  const markBorderGap = params.mark_border_gap ?? 2;
  const markLinecap = (params.mark_round_ends ?? true) ? "round" : "butt";
  const markStyle = params.mark_style ?? "line";
  const markCircleRadius = (params.mark_circle_diameter ?? 4) / 2;

  const innerRadius = Math.min(svgWidth, svgHeight) / 2 - borderWidth;
  const markOuterRadius = innerRadius - markBorderGap;

  const minNumRadius = centerHoleDiameter / 2 + numberSize / 2 + 4;
  // Only auto-shrink marks when gap is positive (user-set gap is honored; negatives allow overlap)
  const effectiveHourMarkLength = showNumbers && numberMarkGap >= 0
    ? Math.max(1, Math.min(hourMarkLength, markOuterRadius - minNumRadius - numberMarkGap))
    : hourMarkLength;
  const numRadius = markOuterRadius - effectiveHourMarkLength - numberMarkGap;

  const els: string[] = [];

  if (faceShape === "circle") {
    const radius = diameter / 2;
    els.push(
      `<circle cx="${cx}" cy="${cy}" r="${radius - borderWidth / 2}" fill="${faceColor}" stroke="${borderColor}" stroke-width="${borderWidth}"/>`
    );
  } else {
    const rx = faceShape === "rounded_square" ? cornerRadius : 0;
    const inset = borderWidth / 2;
    els.push(
      `<rect x="${inset}" y="${inset}" width="${svgWidth - borderWidth}" height="${svgHeight - borderWidth}" rx="${rx}" ry="${rx}" fill="${faceColor}" stroke="${borderColor}" stroke-width="${borderWidth}"/>`
    );
  }

  const markStart = (_a: number, ca: number, sa: number): [number, number] => {
    return [cx + markOuterRadius * ca, cy + markOuterRadius * sa];
  };

  if (showMinuteMarks) {
    const effectiveMinuteMarkLength = Math.min(minuteMarkLength, Math.max(1, effectiveHourMarkLength - 2));
    for (let i = 0; i < 60; i++) {
      if (i % 5 === 0) continue;
      const a = ((i * 6 - 90) * Math.PI) / 180;
      const ca = Math.cos(a), sa = Math.sin(a);
      const [x1, y1] = markStart(a, ca, sa);
      if (markStyle === "circle") {
        const ccx = x1 - markCircleRadius * ca, ccy = y1 - markCircleRadius * sa;
        els.push(`<circle cx="${ccx}" cy="${ccy}" r="${markCircleRadius}" fill="${markColor}"/>`);
      } else {
        els.push(`<line x1="${x1}" y1="${y1}" x2="${x1 - effectiveMinuteMarkLength * ca}" y2="${y1 - effectiveMinuteMarkLength * sa}" stroke="${markColor}" stroke-width="${minuteMarkWidth}" stroke-linecap="${markLinecap}"/>`);
      }
    }
  }

  for (let i = 0; i < 12; i++) {
    if (cardinalMarksOnly && i % 3 !== 0) continue;
    const a = ((i * 30 - 90) * Math.PI) / 180;
    const ca = Math.cos(a), sa = Math.sin(a);
    const [x1, y1] = markStart(a, ca, sa);
    if (markStyle === "circle") {
      const ccx = x1 - markCircleRadius * ca, ccy = y1 - markCircleRadius * sa;
      els.push(`<circle cx="${ccx}" cy="${ccy}" r="${markCircleRadius}" fill="${markColor}"/>`);
    } else {
      els.push(`<line x1="${x1}" y1="${y1}" x2="${x1 - effectiveHourMarkLength * ca}" y2="${y1 - effectiveHourMarkLength * sa}" stroke="${markColor}" stroke-width="${hourMarkWidth}" stroke-linecap="${markLinecap}"/>`);
    }
  }

  if (showNumbers) {
    for (let i = 1; i <= 12; i++) {
      if (cardinalNumbersOnly && i % 3 !== 0) continue;
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

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}px" height="${svgHeight}px" viewBox="0 0 ${svgWidth} ${svgHeight}">\n${els.join("\n")}\n</svg>`;
}
