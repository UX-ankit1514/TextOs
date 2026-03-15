'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CANVAS_SIZE } from '@/types/glyph';

interface CipherDisplayProps {
  messageLength: number;
  wordLengths: number[]; // Array of word lengths to recreate spacing
}

// Basic geometric paths to use as cipher symbols
const CIPHER_SYMBOLS = [
  'M 100 20 A 80 80 0 1 1 99.9 20', // Circle
  'M 100 20 L 170 150 L 30 150 Z', // Triangle
  'M 20 20 L 180 20 L 180 180 L 20 180 Z', // Square
  'M 100 20 L 180 100 L 100 180 L 20 100 Z', // Diamond
  'M 50 20 C 150 20 150 180 50 180', // Simple curve
  'M 100 20 L 100 180 M 20 100 L 180 100', // Cross
  'M 50 50 A 50 50 0 1 1 49.9 50 Z M 150 150 A 30 30 0 1 1 149.9 150 Z', // Two dots
  'M 20 180 Q 100 20 180 180', // Arch
];

export default function CipherDisplay({ messageLength, wordLengths }: CipherDisplayProps) {
  // Generate stable random symbols for each character position
  const symbols = useMemo(() => {
    return Array.from({ length: messageLength }).map(() => {
      const idx = Math.floor(Math.random() * CIPHER_SYMBOLS.length);
      return CIPHER_SYMBOLS[idx];
    });
  }, [messageLength]);

  // Group symbols into words to maintain original spacing structure
  const symbolWords = useMemo(() => {
    const words: string[][] = [];
    let currentIndex = 0;
    
    for (const len of wordLengths) {
      if (len === -1) {
        words.push(['\n']);
      } else {
        const word = symbols.slice(currentIndex, currentIndex + len);
        words.push(word);
        currentIndex += len;
      }
    }
    return words;
  }, [symbols, wordLengths]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null; // Avoid hydration mismatch

  return (
    <div className="flex flex-wrap items-baseline gap-y-4 w-full justify-center lg:justify-start">
      {symbolWords.map((word, wordIndex) => {
        if (word[0] === '\n') {
          return <div key={`br-${wordIndex}`} className="w-full h-0 basis-full" aria-hidden="true" />;
        }

        return (
          <div key={`word-${wordIndex}`} className="flex items-center mr-6 mb-4 break-inside-avoid">
            {word.map((path, charIndex) => {
              const globalIndex = wordIndex * 1000 + charIndex;
              
              return (
                <motion.div
                  key={globalIndex}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ 
                    delay: (charIndex + wordIndex) * 0.05, 
                    duration: 0.5 
                  }}
                  className="relative h-12 sm:h-16 md:h-20 aspect-square flex items-center justify-center -mx-1"
                >
                  <svg
                    viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`}
                    className="w-full h-full opacity-60 mix-blend-multiply drop-shadow-sm"
                    style={{
                      animation: `cipher-shimmer ${2 + Math.random() * 2}s infinite ease-in-out alternate`
                    }}
                  >
                    <path 
                      d={path} 
                      fill="none" 
                      stroke="var(--charcoal-soft)" 
                      strokeWidth="8" 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                    />
                  </svg>
                </motion.div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
