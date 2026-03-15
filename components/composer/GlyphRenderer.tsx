'use client';

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MappedGlyph } from '@/types/glyph';
import { CANVAS_SIZE } from '@/types/glyph';

interface GlyphRendererProps {
  mappedText: MappedGlyph[];
  className?: string;
  glyphColor?: string;
}

export default function GlyphRenderer({
  mappedText,
  className = '',
  glyphColor = 'var(--charcoal)',
}: GlyphRendererProps) {
  // Split mapped text into words, keeping track of original spaces for layout
  const words = useMemo(() => {
    const result: MappedGlyph[][] = [];
    let currentWord: MappedGlyph[] = [];

    mappedText.forEach((glyph) => {
      if (glyph.char === '\n') {
        if (currentWord.length > 0) result.push(currentWord);
        result.push([glyph]); // newline acts as its own special 'word'
        currentWord = [];
      } else if (glyph.isSpace) {
        if (currentWord.length > 0) result.push(currentWord);
        result.push([glyph]); // space gets pushed as a separator
        currentWord = [];
      } else {
        currentWord.push(glyph);
      }
    });

    if (currentWord.length > 0) result.push(currentWord);
    return result;
  }, [mappedText]);

  return (
    <div
      className={`flex flex-wrap items-baseline content-start gap-y-4 w-full h-full p-4 ${className}`}
    >
      <AnimatePresence>
        {words.map((word, wordIndex) => (
          <div
            key={`word-${wordIndex}`}
            className="flex items-center break-inside-avoid shadow-sm"
          >
            {word.map((glyph, charIndex) => {
              const globalIndex = wordIndex * 1000 + charIndex; // Unique key

              if (glyph.char === '\n') {
                return (
                  <div
                    key={globalIndex}
                    className="w-full h-0 basis-full"
                    aria-hidden="true"
                  />
                );
              }

              if (glyph.isSpace) {
                return (
                  <div
                    key={globalIndex}
                    className="h-10 sm:h-12 md:h-16 w-3 sm:w-4 md:w-6"
                    aria-hidden="true"
                  />
                );
              }

              // Normal character or punctuation
              return (
                <motion.div
                  key={globalIndex}
                  initial={{ opacity: 0, scale: 0.8, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="relative h-10 sm:h-14 md:h-16 lg:h-20 aspect-square flex items-center justify-center -mx-1 sm:-mx-1.5 md:-mx-2"
                >
                  {glyph.svgPath ? (
                    <svg
                      viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`}
                      className="w-full h-full drop-shadow-sm"
                      preserveAspectRatio="xMidYMid meet"
                    >
                      <path d={glyph.svgPath} fill={glyphColor} />
                    </svg>
                  ) : (
                    // Fallback for punctuation or numbers
                    <span
                      className="text-lg sm:text-2xl md:text-3xl font-mono opacity-60"
                      style={{ color: glyphColor }}
                    >
                      {glyph.char}
                    </span>
                  )}
                </motion.div>
              );
            })}
          </div>
        ))}

        {/* Blinking cursor at the end */}
        <motion.div
          layout
          className="h-10 sm:h-14 md:h-16 lg:h-20 w-[2px] bg-accent ml-1 cursor-blink"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      </AnimatePresence>

      {mappedText.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center p-8 pointer-events-none">
          <p className="text-charcoal-muted/30 font-light text-xl text-center">
            Your custom alphabet will appear here
          </p>
        </div>
      )}
    </div>
  );
}
