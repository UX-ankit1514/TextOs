import { create } from 'zustand';
import type { GlyphData, StrokePoint } from '@/types/glyph';
import { ALPHABET, CANVAS_SIZE } from '@/types/glyph';
import { getCompositeSvgPath } from './stroke';

interface GlyphStore {
  glyphs: Record<string, GlyphData>;
  messageText: string;
  hint: string;
  password: string;

  // Glyph actions
  setGlyph: (letter: string, strokes: StrokePoint[][]) => void;
  clearGlyph: (letter: string) => void;
  clearAll: () => void;
  setGlyphDirect: (letter: string, glyph: GlyphData) => void;

  // Message actions
  setMessageText: (text: string) => void;
  setHint: (hint: string) => void;
  setPassword: (password: string) => void;

  // Computed
  getFilledCount: () => number;
  getUnfilledLetters: () => string[];
  isReady: () => boolean;
}

export const useGlyphStore = create<GlyphStore>((set, get) => ({
  glyphs: {},
  messageText: '',
  hint: '',
  password: '',

  setGlyph: (letter: string, strokes: StrokePoint[][]) => {
    const svgPath = getCompositeSvgPath(strokes);
    const glyph: GlyphData = {
      letter: letter.toUpperCase(),
      strokes,
      svgPath,
      viewBox: { width: CANVAS_SIZE, height: CANVAS_SIZE },
      timestamp: Date.now(),
    };
    set((state) => ({
      glyphs: { ...state.glyphs, [letter.toUpperCase()]: glyph },
    }));
  },

  clearGlyph: (letter: string) => {
    set((state) => {
      const newGlyphs = { ...state.glyphs };
      delete newGlyphs[letter.toUpperCase()];
      return { glyphs: newGlyphs };
    });
  },

  clearAll: () => set({ glyphs: {} }),

  setGlyphDirect: (letter: string, glyph: GlyphData) => {
    set((state) => ({
      glyphs: { ...state.glyphs, [letter.toUpperCase()]: glyph },
    }));
  },

  setMessageText: (text: string) => set({ messageText: text }),
  setHint: (hint: string) => set({ hint }),
  setPassword: (password: string) => set({ password }),

  getFilledCount: () => {
    return Object.keys(get().glyphs).length;
  },

  getUnfilledLetters: () => {
    const filled = Object.keys(get().glyphs);
    return ALPHABET.filter((l) => !filled.includes(l));
  },

  isReady: () => {
    const state = get();
    return (
      Object.keys(state.glyphs).length === 26 &&
      state.messageText.trim().length > 0
    );
  },
}));
