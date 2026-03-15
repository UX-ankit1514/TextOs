'use client';

import React from 'react';
import type { GlyphData } from '@/types/glyph';
import FontExport from './FontExport';
import PostcardExport from './PostcardExport';
import StickerExport from './StickerExport';

interface ExportPanelProps {
  glyphs: Record<string, GlyphData>;
  printRef: React.RefObject<HTMLDivElement | null>;
}

export default function ExportPanel({ glyphs, printRef }: ExportPanelProps) {
  return (
    <div className="w-full flex flex-col gap-6">
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold text-charcoal tracking-tight">
          Export Your Alphabet
        </h2>
        <p className="text-charcoal-muted text-sm mt-1">
          Take these custom characters wherever you go.
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        <FontExport glyphs={glyphs} />
        <PostcardExport printRef={printRef} />
        <StickerExport glyphs={glyphs} />
      </div>

      <div className="mt-8 text-center border-t border-[var(--border)] pt-8">
        <a 
          href="/" 
          className="text-sm font-semibold tracking-wide text-accent hover:text-accent-hover transition-colors"
        >
          Create Another Alphabet →
        </a>
      </div>
    </div>
  );
}
