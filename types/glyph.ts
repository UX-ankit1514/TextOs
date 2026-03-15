// Core data types for Project Hieroglyph glyph system

export interface StrokePoint {
  x: number;
  y: number;
  pressure: number;
}

export interface GlyphData {
  letter: string;
  strokes: StrokePoint[][];   // Multiple strokes per letter
  svgPath: string;            // Computed SVG path string (from perfect-freehand)
  viewBox: {
    width: number;
    height: number;
  };
  timestamp: number;          // When last modified
}

export interface MessagePayload {
  text: string;
  glyphs: Record<string, GlyphData>;
  hint: string;
  senderName?: string;
  createdAt: number;
}

export interface EncryptedMessage {
  id: string;
  ciphertext: string;
  hint: string;
  createdAt: number;
}

export interface MappedGlyph {
  char: string;
  svgPath: string | null;     // null for space / unsupported chars
  viewBox: { width: number; height: number };
  isSpace: boolean;
  isPunctuation: boolean;
}

export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
export const CANVAS_SIZE = 200;
