'use client';

import React, { useState } from 'react';
import JSZip from 'jszip';
import type { GlyphData } from '@/types/glyph';
import { CANVAS_SIZE } from '@/types/glyph';
import Button from '@/components/ui/Button';

interface StickerExportProps {
  glyphs: Record<string, GlyphData>;
}

export default function StickerExport({ glyphs }: StickerExportProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const zip = new JSZip();
      const stickerFolder = zip.folder("hieroglyph-stickers");
      if (!stickerFolder) throw new Error("Could not create ZIP folder");

      const canvas = document.createElement('canvas');
      // Render larger for stickers
      const targetSize = 512;
      canvas.width = targetSize;
      canvas.height = targetSize;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error("Canvas context failed");

      // Generate a PNG for each available letter
      const letters = Object.keys(glyphs);
      
      for (const letter of letters) {
        const glyph = glyphs[letter];
        if (!glyph || !glyph.svgPath) continue;

        ctx.clearRect(0, 0, targetSize, targetSize);
        
        // Scale SVG path to new canvas size
        const scale = targetSize / CANVAS_SIZE;
        ctx.save();
        ctx.scale(scale, scale);
        
        const path2d = new Path2D(glyph.svgPath);
        ctx.fillStyle = '#1A1A1A'; // Charcoal color
        ctx.fill(path2d);
        ctx.restore();

        // Convert to Blob and add to ZIP
        const blob = await new Promise<Blob | null>((resolve) => 
          canvas.toBlob(resolve, 'image/png')
        );
        
        if (blob) {
          stickerFolder.file(`Letter-${letter}.png`, blob);
        }
      }

      // Generate the final ZIP
      const zipBlob = await zip.generateAsync({ type: 'blob' });
      
      // Download
      const link = document.createElement('a');
      link.href = URL.createObjectURL(zipBlob);
      link.download = "hieroglyph-stickers.zip";
      link.click();
      URL.revokeObjectURL(link.href);

    } catch (err) {
      console.error('Sticker export failed', err);
      alert('Failed to generate sticker pack.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <h3 className="text-lg font-bold text-charcoal">Mobile Sticker Pack</h3>
        <p className="text-sm text-charcoal-muted mt-1">
          Export individual letters as transparent PNGs (512x512) for WhatsApp or iMessage.
        </p>
      </div>
      
      <Button 
        variant="secondary" 
        onClick={handleExport}
        disabled={isExporting}
        className="shrink-0 min-w-[140px]"
      >
        {isExporting ? 'Zipping...' : 'Download ZIP'}
      </Button>
    </div>
  );
}
