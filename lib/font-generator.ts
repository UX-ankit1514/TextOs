import opentype from 'opentype.js';
import type { GlyphData } from '@/types/glyph';
import { CANVAS_SIZE } from '@/types/glyph';

/**
 * Parses an SVG path d attribute into opentype.js Path commands.
 * Handles M, L, Q, C, Z commands.
 */
function svgPathToOpentypePath(
  svgD: string,
  glyphWidth: number,
  ascender: number,
  unitsPerEm: number
): opentype.Path {
  const path = new opentype.Path();
  const scale = unitsPerEm / CANVAS_SIZE;
  
  // Parse SVG path commands
  const commands = svgD.match(/[MLQCZ][^MLQCZ]*/gi) || [];
  
  for (const cmd of commands) {
    const type = cmd[0].toUpperCase();
    const args = cmd
      .slice(1)
      .trim()
      .split(/[\s,]+/)
      .map(Number)
      .filter((n) => !isNaN(n));
    
    switch (type) {
      case 'M':
        path.moveTo(args[0] * scale, ascender - args[1] * scale);
        break;
      case 'L':
        path.lineTo(args[0] * scale, ascender - args[1] * scale);
        break;
      case 'Q':
        path.quadraticCurveTo(
          args[0] * scale, ascender - args[1] * scale,
          args[2] * scale, ascender - args[3] * scale
        );
        break;
      case 'C':
        path.bezierCurveTo(
          args[0] * scale, ascender - args[1] * scale,
          args[2] * scale, ascender - args[3] * scale,
          args[4] * scale, ascender - args[5] * scale
        );
        break;
      case 'Z':
        path.closePath();
        break;
    }
  }
  
  return path;
}

/**
 * Generates an OTF font file from a complete set of 26 glyphs.
 * Downloads the file to the user's device.
 */
export async function generateFont(
  glyphs: Record<string, GlyphData>,
  fontFamily: string = 'Hieroglyph Custom'
): Promise<void> {
  const unitsPerEm = 1000;
  const ascender = 800;
  const descender = -200;
  const glyphWidth = 600;
  
  // Create notdef glyph
  const notdefPath = new opentype.Path();
  notdefPath.moveTo(100, 0);
  notdefPath.lineTo(100, ascender);
  notdefPath.lineTo(500, ascender);
  notdefPath.lineTo(500, 0);
  notdefPath.closePath();
  
  const notdefGlyph = new opentype.Glyph({
    name: '.notdef',
    unicode: 0,
    advanceWidth: glyphWidth,
    path: notdefPath,
  });
  
  // Create space glyph
  const spaceGlyph = new opentype.Glyph({
    name: 'space',
    unicode: 32,
    advanceWidth: glyphWidth / 2,
    path: new opentype.Path(),
  });
  
  const opentypeGlyphs: opentype.Glyph[] = [notdefGlyph, spaceGlyph];
  
  // Create a glyph for each letter (uppercase + lowercase map to same glyph)
  for (let i = 0; i < 26; i++) {
    const letter = String.fromCharCode(65 + i); // A-Z
    const glyphData = glyphs[letter];
    
    if (glyphData && glyphData.svgPath) {
      const path = svgPathToOpentypePath(
        glyphData.svgPath, glyphWidth, ascender, unitsPerEm
      );
      
      // Uppercase
      const upperGlyph = new opentype.Glyph({
        name: letter,
        unicode: 65 + i,
        advanceWidth: glyphWidth,
        path: path,
      });
      opentypeGlyphs.push(upperGlyph);
      
      // Lowercase (same path)
      const lowerGlyph = new opentype.Glyph({
        name: letter.toLowerCase(),
        unicode: 97 + i,
        advanceWidth: glyphWidth,
        path: path,
      });
      opentypeGlyphs.push(lowerGlyph);
    }
  }
  
  const font = new opentype.Font({
    familyName: fontFamily,
    styleName: 'Regular',
    unitsPerEm,
    ascender,
    descender,
    glyphs: opentypeGlyphs,
  });
  
  font.download();
}

/**
 * Triggers a browser download of the generated font.
 */
export function downloadFont(
  glyphs: Record<string, GlyphData>,
  fontFamily?: string
): void {
  generateFont(glyphs, fontFamily);
}
