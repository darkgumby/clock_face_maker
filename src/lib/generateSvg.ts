const ROMAN = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"];
const MM_PER_INCH = 25.4;

export type FaceShape = "circle" | "square" | "rounded_square";
export type MarkStyle = "line" | "circle" | "square" | "diamond";
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

function markPolygon(ccx: number, ccy: number, ca: number, sa: number, localPts: [number, number][], fill: string): string {
  const pts = localPts.map(([lx, ly]) =>
    `${(ccx + lx * (-sa) + ly * ca).toFixed(2)},${(ccy + lx * ca + ly * sa).toFixed(2)}`
  ).join(" ");
  return `<polygon points="${pts}" fill="${fill}"/>`;
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
  hour_mark_style?: MarkStyle;
  hour_mark_circle_diameter?: number;
  hour_mark_square_size?: number;
  hour_mark_diamond_width?: number;
  hour_mark_diamond_height?: number;
  minute_mark_style?: MarkStyle;
  minute_mark_circle_diameter?: number;
  minute_mark_square_size?: number;
  minute_mark_diamond_width?: number;
  minute_mark_diamond_height?: number;
  laser_mode?: boolean;
  show_crosshair?: boolean;
  unit_preference?: "mm" | "in";
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
  const hourMarkStyle = params.hour_mark_style ?? "line";
  const hourMarkCircleRadius = (params.hour_mark_circle_diameter ?? 4) / 2;
  const hourMarkSquareSize = params.hour_mark_square_size ?? 5;
  const hourMarkDiamondW = params.hour_mark_diamond_width ?? 5;
  const hourMarkDiamondH = params.hour_mark_diamond_height ?? 8;
  const minuteMarkStyle = params.minute_mark_style ?? "line";
  const minuteMarkCircleRadius = (params.minute_mark_circle_diameter ?? 3) / 2;
  const minuteMarkSquareSize = params.minute_mark_square_size ?? 3;
  const minuteMarkDiamondW = params.minute_mark_diamond_width ?? 3;
  const minuteMarkDiamondH = params.minute_mark_diamond_height ?? 5;
  const laserMode = params.laser_mode ?? false;
  const showCrosshair = params.show_crosshair ?? false;

  // In laser mode, override colors to LightBurn conventions:
  // red = engrave/fill, black = cut, green = alignment
  const effectiveFaceColor   = laserMode ? "#ff0000" : (params.face_color ?? "#ffffff");
  const effectiveBorderColor = laserMode ? "#000000" : (params.border_color ?? "#000000");
  const effectiveMarkColor   = laserMode ? "#000000" : (params.mark_color ?? "#000000");
  const effectiveCrosshairColor = laserMode ? "#00ff00" : (params.mark_color ?? "#000000");

  const innerRadius = Math.min(svgWidth, svgHeight) / 2 - borderWidth;
  const markOuterRadius = innerRadius - markBorderGap;

  const minNumRadius = centerHoleDiameter / 2 + numberSize / 2 + 4;
  // Only auto-shrink marks when gap is positive (user-set gap is honored; negatives allow overlap)
  const effectiveHourMarkLength = showNumbers && numberMarkGap >= 0
    ? Math.max(1, Math.min(hourMarkLength, markOuterRadius - minNumRadius - numberMarkGap))
    : hourMarkLength;
  const numRadius = markOuterRadius - effectiveHourMarkLength - numberMarkGap;

  const faceEls: string[] = [];
  const minuteMarkEls: string[] = [];
  const hourMarkEls: string[] = [];
  const numberEls: string[] = [];
  const centerEls: string[] = [];

  if (faceShape === "circle") {
    const radius = diameter / 2;
    faceEls.push(
      `<circle cx="${cx}" cy="${cy}" r="${radius - borderWidth / 2}" fill="${effectiveFaceColor}" stroke="${effectiveBorderColor}" stroke-width="${borderWidth}"/>`
    );
  } else {
    const rx = faceShape === "rounded_square" ? cornerRadius : 0;
    const inset = borderWidth / 2;
    faceEls.push(
      `<rect x="${inset}" y="${inset}" width="${svgWidth - borderWidth}" height="${svgHeight - borderWidth}" rx="${rx}" ry="${rx}" fill="${effectiveFaceColor}" stroke="${effectiveBorderColor}" stroke-width="${borderWidth}"/>`
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
      if (minuteMarkStyle === "circle") {
        const ccx = x1 - minuteMarkCircleRadius * ca, ccy = y1 - minuteMarkCircleRadius * sa;
        minuteMarkEls.push(`<circle cx="${ccx}" cy="${ccy}" r="${minuteMarkCircleRadius}" fill="${effectiveMarkColor}"/>`);
      } else if (minuteMarkStyle === "square") {
        const s = minuteMarkSquareSize, ccx = x1 - s / 2 * ca, ccy = y1 - s / 2 * sa;
        minuteMarkEls.push(markPolygon(ccx, ccy, ca, sa, [[-s/2,-s/2],[s/2,-s/2],[s/2,s/2],[-s/2,s/2]], markColor));
      } else if (minuteMarkStyle === "diamond") {
        const ccx = x1 - minuteMarkDiamondH / 2 * ca, ccy = y1 - minuteMarkDiamondH / 2 * sa;
        minuteMarkEls.push(markPolygon(ccx, ccy, ca, sa, [[0,minuteMarkDiamondH/2],[minuteMarkDiamondW/2,0],[0,-minuteMarkDiamondH/2],[-minuteMarkDiamondW/2,0]], markColor));
      } else {
        minuteMarkEls.push(`<line x1="${x1}" y1="${y1}" x2="${x1 - effectiveMinuteMarkLength * ca}" y2="${y1 - effectiveMinuteMarkLength * sa}" stroke="${effectiveMarkColor}" stroke-width="${minuteMarkWidth}" stroke-linecap="${markLinecap}"/>`);
      }
    }
  }

  for (let i = 0; i < 12; i++) {
    if (cardinalMarksOnly && i % 3 !== 0) continue;
    const a = ((i * 30 - 90) * Math.PI) / 180;
    const ca = Math.cos(a), sa = Math.sin(a);
    const [x1, y1] = markStart(a, ca, sa);
    if (hourMarkStyle === "circle") {
      const ccx = x1 - hourMarkCircleRadius * ca, ccy = y1 - hourMarkCircleRadius * sa;
      hourMarkEls.push(`<circle cx="${ccx}" cy="${ccy}" r="${hourMarkCircleRadius}" fill="${effectiveMarkColor}"/>`);
    } else if (hourMarkStyle === "square") {
      const s = hourMarkSquareSize, ccx = x1 - s / 2 * ca, ccy = y1 - s / 2 * sa;
      hourMarkEls.push(markPolygon(ccx, ccy, ca, sa, [[-s/2,-s/2],[s/2,-s/2],[s/2,s/2],[-s/2,s/2]], markColor));
    } else if (hourMarkStyle === "diamond") {
      const ccx = x1 - hourMarkDiamondH / 2 * ca, ccy = y1 - hourMarkDiamondH / 2 * sa;
      hourMarkEls.push(markPolygon(ccx, ccy, ca, sa, [[0,hourMarkDiamondH/2],[hourMarkDiamondW/2,0],[0,-hourMarkDiamondH/2],[-hourMarkDiamondW/2,0]], markColor));
    } else {
      hourMarkEls.push(`<line x1="${x1}" y1="${y1}" x2="${x1 - effectiveHourMarkLength * ca}" y2="${y1 - effectiveHourMarkLength * sa}" stroke="${effectiveMarkColor}" stroke-width="${hourMarkWidth}" stroke-linecap="${markLinecap}"/>`);
    }
  }

  if (showNumbers) {
    for (let i = 1; i <= 12; i++) {
      if (cardinalNumbersOnly && i % 3 !== 0) continue;
      const a = ((i * 30 - 90) * Math.PI) / 180;
      const label = numberRoman ? ROMAN[i - 1] : String(i);
      numberEls.push(
        `<text x="${cx + numRadius * Math.cos(a)}" y="${cy + numRadius * Math.sin(a)}" text-anchor="middle" dominant-baseline="central" font-family="${numberFont}" font-size="${numberSize}px" font-weight="${numberFontWeight}" font-style="${numberFontItalic ? "italic" : "normal"}" fill="${effectiveMarkColor}" text-rendering="geometricPrecision">${label}</text>`
      );
    }
  }

  centerEls.push(
    `<circle cx="${cx}" cy="${cy}" r="${centerHoleDiameter / 2}" fill="#000000"/>`
  );

  const crosshairEls: string[] = [];
  if (showCrosshair) {
    const cw = 0.5;
    crosshairEls.push(
      `<line x1="0" y1="${cy}" x2="${svgWidth}" y2="${cy}" stroke="${effectiveCrosshairColor}" stroke-width="${cw}"/>`,
      `<line x1="${cx}" y1="0" x2="${cx}" y2="${svgHeight}" stroke="${effectiveCrosshairColor}" stroke-width="${cw}"/>`
    );
  }

  const metadata = `<metadata>{"generator":"clock-face-maker","src":"https://github.com/darkgumby/clock_face_maker","params":${JSON.stringify(params)}}</metadata>`;

  const groups = [
    metadata,
    `<g id="face">\n${faceEls.join("\n")}\n</g>`,
    ...(minuteMarkEls.length ? [`<g id="minute-marks">\n${minuteMarkEls.join("\n")}\n</g>`] : []),
    `<g id="hour-marks">\n${hourMarkEls.join("\n")}\n</g>`,
    ...(numberEls.length ? [`<g id="numbers">\n${numberEls.join("\n")}\n</g>`] : []),
    `<g id="center">\n${centerEls.join("\n")}\n</g>`,
    ...(crosshairEls.length ? [`<g id="crosshair">\n${crosshairEls.join("\n")}\n</g>`] : []),
  ];

  const unitPref = params.unit_preference ?? "mm";
  const widthAttr = unitPref === "in" ? `${(svgWidth / MM_PER_INCH).toFixed(4)}in` : `${svgWidth}mm`;
  const heightAttr = unitPref === "in" ? `${(svgHeight / MM_PER_INCH).toFixed(4)}in` : `${svgHeight}mm`;

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:inkscape="http://www.inkscape.org/namespaces/inkscape" inkscape:document-units="${unitPref}" width="${widthAttr}" height="${heightAttr}" viewBox="0 0 ${svgWidth} ${svgHeight}">\n${groups.join("\n")}\n</svg>`;
}
