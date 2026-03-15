import type { GlyphData, MappedGlyph } from '@/types/glyph';
import { CANVAS_SIZE } from '@/types/glyph';

/**
 * Maps standard text to the user's custom drawn glyphs.
 * Unrecognized characters or spaces get a standard width spacer.
 */
export function mapTextToGlyphs(
  text: string,
  customGlyphs: Record<string, GlyphData>
): MappedGlyph[] {
  return text.split('').map((char) => {
    const isSpace = char === ' ' || char === '\n';
    
    // Check if character is a drawn letter (case insensitive)
    const upperChar = char.toUpperCase();
    const glyphData = customGlyphs[upperChar];
    
    if (glyphData && !isSpace) {
      return {
        char,
        svgPath: glyphData.svgPath,
        viewBox: glyphData.viewBox,
        isSpace: false,
        isPunctuation: false,
      };
    }
    
    // Fallback for spaces, punctuation, or numbers
    return {
      char,
      svgPath: null,
      viewBox: { width: CANVAS_SIZE * 0.5, height: CANVAS_SIZE }, // half width for spaces
      isSpace,
      isPunctuation: !isSpace && !glyphData,
    };
  });
}
