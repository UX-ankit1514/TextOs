'use client';

import React, { useState } from 'react';
import type { GlyphData } from '@/types/glyph';
import { downloadFont } from '@/lib/font-generator';
import Button from '@/components/ui/Button';

interface FontExportProps {
  glyphs: Record<string, GlyphData>;
}

export default function FontExport({ glyphs }: FontExportProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // Small timeout to allow UI to update to "Generating..."
      await new Promise(resolve => setTimeout(resolve, 100));
      downloadFont(glyphs, 'Hieroglyph Custom');
    } catch (err) {
      console.error('Font generation failed', err);
      alert('Failed to generate font file.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <h3 className="text-lg font-bold text-charcoal">Desktop Font (.OTF)</h3>
        <p className="text-sm text-charcoal-muted mt-1">
          Install the alphabet on your computer to use in Word, Figma, or any design tool.
        </p>
      </div>
      
      <Button 
        variant="secondary" 
        onClick={handleExport}
        disabled={isExporting}
        className="shrink-0 min-w-[140px]"
      >
        {isExporting ? 'Generating...' : 'Download Font'}
      </Button>
    </div>
  );
}
