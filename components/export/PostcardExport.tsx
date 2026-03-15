'use client';

import React, { useState } from 'react';
import { toPng } from 'html-to-image';
import Button from '@/components/ui/Button';

interface PostcardExportProps {
  printRef: React.RefObject<HTMLDivElement | null>;
}

export default function PostcardExport({ printRef }: PostcardExportProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (!printRef.current) return;
    
    setIsExporting(true);
    try {
      // html-to-image takes a snapshot of the DOM element
      const dataUrl = await toPng(printRef.current, {
        quality: 1,
        pixelRatio: 2, // High-res
        backgroundColor: '#F5F0EB', // Match bone theme
        style: {
          padding: '60px',
        }
      });
      
      // Trigger download
      const link = document.createElement('a');
      link.download = 'hieroglyph-postcard.png';
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Postcard export failed', err);
      alert('Failed to generate high-res postcard.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="card p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
      <div>
        <h3 className="text-lg font-bold text-charcoal">High-Res Postcard</h3>
        <p className="text-sm text-charcoal-muted mt-1">
          Save the entire message as a high-quality PNG image perfectly sized for sharing.
        </p>
      </div>
      
      <Button 
        variant="secondary" 
        onClick={handleExport}
        disabled={isExporting}
        className="shrink-0 min-w-[140px]"
      >
        {isExporting ? 'Capturing...' : 'Export Image'}
      </Button>
    </div>
  );
}
