'use client';

import React, { useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import LetterCanvas from './LetterCanvas';
import Button from '@/components/ui/Button';
import { ALPHABET } from '@/types/glyph';
import type { StrokePoint } from '@/types/glyph';
import { useGlyphStore } from '@/lib/glyph-store';
import { quickFill } from '@/lib/quick-fill';

export default function AlphabetGrid() {
  const router = useRouter();
  const { glyphs, setGlyph, clearGlyph, setGlyphDirect } = useGlyphStore();
  const filledCount = Object.keys(glyphs).length;
  const canQuickFill = filledCount >= 5;

  const handleStrokesChange = useCallback(
    (letter: string, strokes: StrokePoint[][]) => {
      setGlyph(letter, strokes);
    },
    [setGlyph]
  );

  const handleClear = useCallback(
    (letter: string) => {
      clearGlyph(letter);
    },
    [clearGlyph]
  );

  const handleQuickFill = useCallback(() => {
    const unfilled = ALPHABET.filter((l) => !glyphs[l]);
    if (unfilled.length === 0) return;

    const generated = quickFill(glyphs, unfilled);
    Object.entries(generated).forEach(([letter, glyph]) => {
      setGlyphDirect(letter, glyph);
    });
  }, [glyphs, setGlyphDirect]);

  const handleContinue = () => {
    router.push('/compose');
  };

  const progressPercentage = useMemo(
    () => Math.round((filledCount / 26) * 100),
    [filledCount]
  );

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center font-mono lowercase text-[#333333]">
      {/* Header */}
      <h2 className="mb-12 text-sm tracking-widest text-[#333333]">
        create your alphabet
      </h2>

      {/* Grid */}
      <div 
        className="w-full grid gap-2 md:gap-4 mb-16"
        style={{ gridTemplateColumns: 'repeat(13, minmax(0, 1fr))' }}
      >
        {ALPHABET.map((letter) => (
          <LetterCanvas
            key={letter}
            letter={letter}
            svgPath={glyphs[letter]?.svgPath}
            onStrokesChange={handleStrokesChange}
            onClear={handleClear}
            isFilled={!!glyphs[letter]}
          />
        ))}
      </div>

      {/* Naked Action Buttons */}
      <div className="flex justify-between w-full px-4 md:px-12">
        <button
          onClick={() => {
            ALPHABET.forEach((letter) => handleClear(letter));
          }}
          className="hover:opacity-60 transition-opacity cursor-pointer text-[#333333]"
        >
          clear
        </button>

        <button
          onClick={handleContinue}
          className="hover:opacity-60 transition-opacity cursor-pointer text-[#333333]"
        >
          done
        </button>
      </div>
    </div>
  );
}
