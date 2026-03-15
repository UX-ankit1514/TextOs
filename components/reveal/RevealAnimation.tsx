'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { interpolate } from 'flubber';
import type { MappedGlyph } from '@/types/glyph';
import { CANVAS_SIZE } from '@/types/glyph';

interface RevealAnimationProps {
  mappedText: MappedGlyph[];
  onComplete?: () => void;
}

// Same symbol paths as CipherDisplay for morph origin
const CIPHER_SYMBOLS = [
  'M 100 20 A 80 80 0 1 1 99.9 20',
  'M 100 20 L 170 150 L 30 150 Z',
  'M 20 20 L 180 20 L 180 180 L 20 180 Z',
  'M 100 20 L 180 100 L 100 180 L 20 100 Z',
  'M 50 20 C 150 20 150 180 50 180',
  'M 100 20 L 100 180 M 20 100 L 180 100',
  'M 50 50 A 50 50 0 1 1 49.9 50 Z M 150 150 A 30 30 0 1 1 149.9 150 Z',
  'M 20 180 Q 100 20 180 180',
];

export default function RevealAnimation({ mappedText, onComplete }: RevealAnimationProps) {
  const [words, setWords] = useState<MappedGlyph[][]>([]);
  const [animating, setAnimating] = useState(true);

  // Group into words
  useEffect(() => {
    const w: MappedGlyph[][] = [];
    let cur: MappedGlyph[] = [];
    mappedText.forEach((g) => {
      if (g.char === '\n') {
        if (cur.length) w.push(cur);
        w.push([g]);
        cur = [];
      } else if (g.isSpace) {
        if (cur.length) w.push(cur);
        w.push([g]);
        cur = [];
      } else {
        cur.push(g);
      }
    });
    if (cur.length) w.push(cur);
    setWords(w);

    // Sequence timing
    const totalChars = mappedText.filter(g => !g.isSpace && g.char !== '\n').length;
    const duration = totalChars * 100 + 1500;
    
    const timer = setTimeout(() => {
      setAnimating(false);
      onComplete?.();
    }, duration);

    return () => clearTimeout(timer);
  }, [mappedText, onComplete]);

  return (
    <div className="flex flex-wrap items-baseline gap-y-4 w-full justify-center lg:justify-start">
      {words.map((word, wordIndex) => {
        if (word[0].char === '\n') {
          return <div key={`br-${wordIndex}`} className="w-full h-0 basis-full" aria-hidden="true" />;
        }
        if (word[0].isSpace) {
          return <div key={`sp-${wordIndex}`} className="h-12 sm:h-16 md:h-20 w-4 sm:w-6 md:w-8" />;
        }

        return (
          <div key={`word-${wordIndex}`} className="flex items-center mr-6 mb-4 break-inside-avoid shadow-sm rounded-lg p-1 bg-white/50">
            {word.map((glyph, charIndex) => {
              const globalIndex = wordIndex * 1000 + charIndex;
              const delay = globalIndex * 0.1; // Staggered reveal
              
              // Pick a random starting cipher symbol (deterministic per character for consistency if rerendered)
              const cipherIdx = (glyph.char.charCodeAt(0) * globalIndex) % CIPHER_SYMBOLS.length;
              const startPath = CIPHER_SYMBOLS[cipherIdx];
              
              const endPath = glyph.svgPath || 'M 100 100 L 100 101'; // Fallback path if none

              return (
                <motion.div
                  key={globalIndex}
                  className="relative h-12 sm:h-16 md:h-20 aspect-square flex items-center justify-center -mx-1"
                >
                  {glyph.svgPath ? (
                    <MorphPath 
                      startPath={startPath} 
                      endPath={endPath} 
                      delay={delay} 
                      animating={animating}
                    />
                  ) : (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.5, rotateX: 90 }}
                      animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                      transition={{ delay, duration: 0.8, type: 'spring' }}
                      className="text-2xl sm:text-3xl font-mono text-charcoal/80"
                    >
                      {glyph.char}
                    </motion.span>
                  )}
                  
                  {/* Exploding particle effect on morph */}
                  {animating && (
                    <ParticleExplosion delay={delay} />
                  )}
                </motion.div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// Inner component to handle Flubber interpolation smoothly via Framer Motion useTransform/animate
function MorphPath({ startPath, endPath, delay, animating }: { startPath: string, endPath: string, delay: number, animating: boolean }) {
  const [path, setPath] = useState(startPath);
  const [fill, setFill] = useState('transparent');
  const [stroke, setStroke] = useState('var(--charcoal-soft)');

  useEffect(() => {
    let interpolator: (t: number) => string;
    try {
      // Flubber interpolation takes two absolute SVG paths
      interpolator = interpolate(startPath, endPath, { maxSegmentLength: 2 });
    } catch {
      // Fallback if flubber fails (e.g., highly complex incompatible shapes)
      interpolator = () => endPath;
    }

    // Manual animation frame loop for flubber (framer motion doesn't natively tween arbitrary SVG paths)
    let startTime: number;
    let animationFrame: number;
    
    const animate = (time: number) => {
      if (!startTime) startTime = time;
      const progress = (time - startTime) / 800; // 800ms morph duration
      
      if (progress < 1) {
        setPath(interpolator(progress));
        setStroke(`rgba(26,26,26,${0.5 - progress * 0.5})`);
        if (progress > 0.5) {
          setFill(`rgba(26,26,26,${(progress - 0.5) * 2})`);
        }
        animationFrame = requestAnimationFrame(animate);
      } else {
        setPath(endPath);
        setFill('var(--charcoal)');
        setStroke('transparent');
      }
    };

    const timer = setTimeout(() => {
      animationFrame = requestAnimationFrame(animate);
    }, delay * 1000);

    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(animationFrame);
    };
  }, [startPath, endPath, delay]);

  return (
    <motion.svg
      viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`}
      className="w-full h-full drop-shadow-sm"
      animate={
        animating ? {
          scale: [1, 1.2, 1],
          y: [0, -10, 0]
        } : {}
      }
      transition={{ delay, duration: 0.6, times: [0, 0.5, 1], type: 'spring' }}
    >
      <path 
        d={path} 
        fill={fill} 
        stroke={stroke} 
        strokeWidth="5" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </motion.svg>
  );
}

function ParticleExplosion({ delay }: { delay: number }) {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 rounded-full bg-accent"
          initial={{ scale: 0, x: 0, y: 0, opacity: 1 }}
          animate={{
            scale: [0, 1, 0],
            x: Math.cos(i * 60 * (Math.PI / 180)) * 40,
            y: Math.sin(i * 60 * (Math.PI / 180)) * 40,
            opacity: 0,
          }}
          transition={{ delay, duration: 0.6, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}
