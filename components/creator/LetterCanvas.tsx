'use client';

import React, { useRef, useCallback, useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { StrokePoint } from '@/types/glyph';
import { CANVAS_SIZE } from '@/types/glyph';
import { getSmoothStroke, getSvgPathFromStroke } from '@/lib/stroke';

interface LetterCanvasProps {
  letter: string;
  svgPath?: string;
  onStrokesChange: (letter: string, strokes: StrokePoint[][]) => void;
  onClear: (letter: string) => void;
  isFilled: boolean;
}

export default function LetterCanvas({
  letter,
  svgPath,
  onStrokesChange,
  onClear,
  isFilled,
}: LetterCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStroke, setCurrentStroke] = useState<StrokePoint[]>([]);
  const [allStrokes, setAllStrokes] = useState<StrokePoint[][]>([]);
  const [isHovered, setIsHovered] = useState(false);

  // Redraw canvas whenever strokes change
  const redrawCanvas = useCallback(
    (strokes: StrokePoint[][], active?: StrokePoint[]) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

      // Draw all completed strokes
      [...strokes, ...(active && active.length > 2 ? [active] : [])].forEach(
        (strokePoints) => {
          const outline = getSmoothStroke(strokePoints);
          const path = getSvgPathFromStroke(outline);
          if (!path) return;

          const path2d = new Path2D(path);
          ctx.fillStyle = '#333333';
          ctx.fill(path2d);
        }
      );
    },
    []
  );

  // Render existing SVG path when glyph is loaded (e.g. from Quick Fill)
  useEffect(() => {
    if (svgPath && allStrokes.length === 0) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
      const path2d = new Path2D(svgPath);
      ctx.fillStyle = '#333333';
      ctx.fill(path2d);
    }
  }, [svgPath, allStrokes.length]);

  const getPoint = (e: React.PointerEvent): StrokePoint => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = CANVAS_SIZE / rect.width;
    const scaleY = CANVAS_SIZE / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
      pressure: e.pressure || 0.5,
    };
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setIsDrawing(true);
    const point = getPoint(e);
    setCurrentStroke([point]);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const point = getPoint(e);
    setCurrentStroke((prev) => {
      const updated = [...prev, point];
      redrawCanvas(allStrokes, updated);
      return updated;
    });
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    setIsDrawing(false);

    if (currentStroke.length > 2) {
      const newStrokes = [...allStrokes, currentStroke];
      setAllStrokes(newStrokes);
      onStrokesChange(letter, newStrokes);
      redrawCanvas(newStrokes);
    }
    setCurrentStroke([]);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setAllStrokes([]);
    setCurrentStroke([]);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    }
    onClear(letter);
  };

  return (
    <div
      className="flex flex-col items-center gap-2 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`relative w-full aspect-square border ${
          isHovered ? 'border-[#333333]' : 'border-gray-300'
        } bg-transparent transition-colors duration-300`}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="drawing-canvas w-full h-full cursor-crosshair touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        />
        
        {/* Clear Button Overlay */}
        {(isFilled || allStrokes.length > 0) && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            onClick={handleClear}
            className="absolute top-1 right-1 text-[#333333] opacity-60 hover:opacity-100 text-[10px]"
            aria-label={`Clear letter ${letter}`}
          >
            ✕
          </motion.button>
        )}
      </div>
      
      <span className={`text-xs font-mono ${isFilled ? 'text-[#333333] font-bold' : 'text-gray-400'}`}>
        {letter}
      </span>
    </div>
  );
}
