import type { GlyphData, StrokePoint } from '@/types/glyph';
import { CANVAS_SIZE } from '@/types/glyph';
import { getCompositeSvgPath } from './stroke';

// Basic template letter paths (simplified geometric representations)
// These are intentionally minimal — Quick Fill transforms them using the user's style
const TEMPLATE_PATHS: Record<string, StrokePoint[][]> = generateTemplateLetters();

interface StyleProfile {
  avgPressure: number;
  avgStrokeWidth: number;
  pressureVariance: number;
  strokeScale: number;
  jitter: number;
}

/**
 * Analyzes the drawing style from completed glyphs.
 */
function analyzeStyle(glyphs: Record<string, GlyphData>): StyleProfile {
  const allStrokes = Object.values(glyphs).flatMap((g) => g.strokes);
  const allPoints = allStrokes.flat();

  if (allPoints.length === 0) {
    return {
      avgPressure: 0.5,
      avgStrokeWidth: 1,
      pressureVariance: 0,
      strokeScale: 1,
      jitter: 0,
    };
  }

  const pressures = allPoints.map((p) => p.pressure);
  const avgPressure = pressures.reduce((a, b) => a + b, 0) / pressures.length;
  const pressureVariance =
    pressures.reduce((sum, p) => sum + Math.pow(p - avgPressure, 2), 0) /
    pressures.length;

  // Calculate average stroke extent to understand scale preference
  const extents = allStrokes.map((stroke) => {
    const xs = stroke.map((p) => p.x);
    const ys = stroke.map((p) => p.y);
    return {
      width: Math.max(...xs) - Math.min(...xs),
      height: Math.max(...ys) - Math.min(...ys),
    };
  });
  const avgWidth = extents.reduce((s, e) => s + e.width, 0) / extents.length;
  const avgHeight = extents.reduce((s, e) => s + e.height, 0) / extents.length;
  const strokeScale = ((avgWidth + avgHeight) / 2 / CANVAS_SIZE) * 2;

  // Jitter: measure average distance between consecutive points
  let totalJitter = 0;
  let jitterCount = 0;
  allStrokes.forEach((stroke) => {
    for (let i = 1; i < stroke.length; i++) {
      const dx = stroke[i].x - stroke[i - 1].x;
      const dy = stroke[i].y - stroke[i - 1].y;
      totalJitter += Math.sqrt(dx * dx + dy * dy);
      jitterCount++;
    }
  });

  return {
    avgPressure,
    avgStrokeWidth: avgWidth,
    pressureVariance,
    strokeScale: Math.max(0.3, Math.min(2, strokeScale)),
    jitter: jitterCount > 0 ? totalJitter / jitterCount : 0,
  };
}

/**
 * Transforms template strokes to match the user's drawing style.
 */
function applyStyleToTemplate(
  template: StrokePoint[][],
  style: StyleProfile,
  _letter: string
): StrokePoint[][] {
  const scale = style.strokeScale;
  const centerX = CANVAS_SIZE / 2;
  const centerY = CANVAS_SIZE / 2;
  const jitterAmount = Math.min(style.jitter * 0.3, 3);

  return template.map((stroke) =>
    stroke.map((point) => {
      // Scale around center
      const sx = centerX + (point.x - centerX) * scale;
      const sy = centerY + (point.y - centerY) * scale;

      // Add human-like jitter
      const jx = sx + (Math.random() - 0.5) * jitterAmount;
      const jy = sy + (Math.random() - 0.5) * jitterAmount;

      // Apply pressure profile
      const pressure =
        style.avgPressure +
        (Math.random() - 0.5) * Math.sqrt(style.pressureVariance) * 0.5;

      return {
        x: Math.max(5, Math.min(CANVAS_SIZE - 5, jx)),
        y: Math.max(5, Math.min(CANVAS_SIZE - 5, jy)),
        pressure: Math.max(0.1, Math.min(1, pressure)),
      };
    })
  );
}

/**
 * Quick Fill: generates glyphs for unfilled letters based on the user's style.
 * Requires at least 5 completed letters for style analysis.
 */
export function quickFill(
  currentGlyphs: Record<string, GlyphData>,
  unfilledLetters: string[]
): Record<string, GlyphData> {
  const style = analyzeStyle(currentGlyphs);
  const newGlyphs: Record<string, GlyphData> = {};

  for (const letter of unfilledLetters) {
    const template = TEMPLATE_PATHS[letter];
    if (!template) continue;

    const styledStrokes = applyStyleToTemplate(template, style, letter);
    const svgPath = getCompositeSvgPath(styledStrokes);

    newGlyphs[letter] = {
      letter,
      strokes: styledStrokes,
      svgPath,
      viewBox: { width: CANVAS_SIZE, height: CANVAS_SIZE },
      timestamp: Date.now(),
    };
  }

  return newGlyphs;
}

/**
 * Generates basic geometric template strokes for all 26 letters.
 * These are simple representations that get transformed by the user's style.
 */
function generateTemplateLetters(): Record<string, StrokePoint[][]> {
  const templates: Record<string, StrokePoint[][]> = {};
  const s = CANVAS_SIZE;
  const pad = 35;
  const l = pad;
  const r = s - pad;
  const t = pad;
  const b = s - pad;
  const cx = s / 2;
  const cy = s / 2;

  function line(
    x1: number, y1: number, x2: number, y2: number, steps = 12
  ): StrokePoint[] {
    const pts: StrokePoint[] = [];
    for (let i = 0; i <= steps; i++) {
      const frac = i / steps;
      pts.push({
        x: x1 + (x2 - x1) * frac,
        y: y1 + (y2 - y1) * frac,
        pressure: 0.5 + Math.sin(frac * Math.PI) * 0.1,
      });
    }
    return pts;
  }

  function arc(
    cxp: number, cyp: number, radius: number,
    startAngle: number, endAngle: number, steps = 20
  ): StrokePoint[] {
    const pts: StrokePoint[] = [];
    for (let i = 0; i <= steps; i++) {
      const frac = i / steps;
      const angle = startAngle + (endAngle - startAngle) * frac;
      pts.push({
        x: cxp + Math.cos(angle) * radius,
        y: cyp + Math.sin(angle) * radius,
        pressure: 0.5 + Math.sin(frac * Math.PI) * 0.1,
      });
    }
    return pts;
  }

  const rad = (r - l) / 2;

  // A: two diagonals + crossbar
  templates['A'] = [
    line(cx, t, l, b), line(cx, t, r, b), line(l + 25, cy + 10, r - 25, cy + 10),
  ];
  // B: vertical + two bumps
  templates['B'] = [
    line(l, t, l, b),
    arc(l, t + rad * 0.5, rad * 0.55, -Math.PI / 2, Math.PI / 2, 16),
    arc(l, cy + rad * 0.3, rad * 0.6, -Math.PI / 2, Math.PI / 2, 16),
  ];
  // C: arc
  templates['C'] = [arc(cx + 10, cy, rad, -2.5, 2.5, 24)];
  // D: vertical + curve
  templates['D'] = [line(l, t, l, b), arc(l, cy, rad * 1.1, -Math.PI / 2, Math.PI / 2, 20)];
  // E: vertical + three horizontals
  templates['E'] = [line(l, t, l, b), line(l, t, r, t), line(l, cy, r - 15, cy), line(l, b, r, b)];
  // F: vertical + two horizontals
  templates['F'] = [line(l, t, l, b), line(l, t, r, t), line(l, cy, r - 15, cy)];
  // G: arc + horizontal
  templates['G'] = [arc(cx + 10, cy, rad, -2.5, 2.5, 24), line(cx, cy, r, cy)];
  // H: two verticals + crossbar
  templates['H'] = [line(l, t, l, b), line(r, t, r, b), line(l, cy, r, cy)];
  // I: vertical + serifs
  templates['I'] = [line(cx, t, cx, b), line(cx - 15, t, cx + 15, t), line(cx - 15, b, cx + 15, b)];
  // J: curve + top serif
  templates['J'] = [line(r - 10, t, r - 10, b - 25), arc(cx, b - 25, r - 10 - cx, 0, Math.PI, 14)];
  // K: vertical + diagonals
  templates['K'] = [line(l, t, l, b), line(r, t, l, cy), line(l, cy, r, b)];
  // L: vertical + horizontal
  templates['L'] = [line(l, t, l, b), line(l, b, r, b)];
  // M: vertical + peaks
  templates['M'] = [line(l, b, l, t), line(l, t, cx, cy + 10), line(cx, cy + 10, r, t), line(r, t, r, b)];
  // N: two verticals + diagonal
  templates['N'] = [line(l, b, l, t), line(l, t, r, b), line(r, b, r, t)];
  // O: circle
  templates['O'] = [arc(cx, cy, rad, 0, Math.PI * 2, 28)];
  // P: vertical + bump
  templates['P'] = [line(l, b, l, t), arc(l, t + rad * 0.5, rad * 0.6, -Math.PI / 2, Math.PI / 2, 16)];
  // Q: circle + tail
  templates['Q'] = [arc(cx, cy, rad, 0, Math.PI * 2, 28), line(cx + 10, cy + 10, r + 5, b + 5)];
  // R: vertical + bump + leg
  templates['R'] = [
    line(l, b, l, t),
    arc(l, t + rad * 0.5, rad * 0.55, -Math.PI / 2, Math.PI / 2, 16),
    line(l + 10, cy, r, b),
  ];
  // S: s-curve
  templates['S'] = [
    arc(cx, t + rad * 0.45, rad * 0.5, -2.8, 1.2, 14),
    arc(cx, b - rad * 0.45, rad * 0.5, -2.0 + Math.PI, 1.2 + Math.PI, 14),
  ];
  // T: horizontal + vertical
  templates['T'] = [line(l, t, r, t), line(cx, t, cx, b)];
  // U: two verticals + bottom arc
  templates['U'] = [line(l, t, l, b - 25), arc(cx, b - 25, cx - l, Math.PI, 0, 16), line(r, b - 25, r, t)];
  // V: two diagonals
  templates['V'] = [line(l, t, cx, b), line(cx, b, r, t)];
  // W: four diagonals
  templates['W'] = [
    line(l, t, l + 25, b),
    line(l + 25, b, cx, cy + 10),
    line(cx, cy + 10, r - 25, b),
    line(r - 25, b, r, t),
  ];
  // X: two diagonals
  templates['X'] = [line(l, t, r, b), line(r, t, l, b)];
  // Y: two diagonals + vertical
  templates['Y'] = [line(l, t, cx, cy), line(r, t, cx, cy), line(cx, cy, cx, b)];
  // Z: horizontal + diagonal + horizontal
  templates['Z'] = [line(l, t, r, t), line(r, t, l, b), line(l, b, r, b)];

  return templates;
}
