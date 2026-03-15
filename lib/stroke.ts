import getStroke from 'perfect-freehand';
import type { StrokePoint } from '@/types/glyph';

// Tuned stroke options for elegant, ink-like rendering
const STROKE_OPTIONS = {
  size: 6,
  thinning: 0.5,
  smoothing: 0.5,
  streamline: 0.5,
  easing: (t: number) => t,
  start: {
    taper: 0,
    easing: (t: number) => t,
    cap: true,
  },
  end: {
    taper: 20,
    easing: (t: number) => t,
    cap: true,
  },
};

/**
 * Converts raw pointer input points into a smooth stroke using perfect-freehand.
 * Returns an array of [x, y] outline points.
 */
export function getSmoothStroke(points: StrokePoint[]): number[][] {
  const inputPoints = points.map((p) => [p.x, p.y, p.pressure]);
  return getStroke(inputPoints, STROKE_OPTIONS);
}

/**
 * Converts a perfect-freehand stroke outline (array of [x, y] points)
 * into an SVG <path> d attribute string.
 */
export function getSvgPathFromStroke(stroke: number[][]): string {
  if (!stroke.length) return '';

  const d: string[] = [];
  const [first, ...rest] = stroke;

  d.push(`M ${first[0].toFixed(2)} ${first[1].toFixed(2)}`);

  // Use quadratic bezier curves between each pair of points for smoothness
  for (let i = 0; i < rest.length; i++) {
    const [x0, y0] = rest[i];
    if (i < rest.length - 1) {
      const [x1, y1] = rest[i + 1];
      const mx = ((x0 + x1) / 2).toFixed(2);
      const my = ((y0 + y1) / 2).toFixed(2);
      d.push(`Q ${x0.toFixed(2)} ${y0.toFixed(2)} ${mx} ${my}`);
    } else {
      d.push(`L ${x0.toFixed(2)} ${y0.toFixed(2)}`);
    }
  }

  d.push('Z');
  return d.join(' ');
}

/**
 * Converts an array of strokes into a combined SVG path d attribute.
 */
export function getCompositeSvgPath(strokes: StrokePoint[][]): string {
  return strokes
    .map((strokePoints) => {
      const outline = getSmoothStroke(strokePoints);
      return getSvgPathFromStroke(outline);
    })
    .filter(Boolean)
    .join(' ');
}
