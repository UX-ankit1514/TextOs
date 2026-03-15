'use client';

import React, { useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import PageTransition from '@/components/ui/PageTransition';
import TextInput from '@/components/composer/TextInput';
import GlyphRenderer from '@/components/composer/GlyphRenderer';
import { mapTextToGlyphs } from '@/components/composer/GlyphMapper';
import { useGlyphStore } from '@/lib/glyph-store';

export default function ComposePage() {
  const router = useRouter();
  const { glyphs, messageText, setMessageText, isReady } = useGlyphStore();

  // Redirect if no glyphs
  useEffect(() => {
    if (Object.keys(glyphs).length === 0) {
      router.replace('/create');
    }
  }, [glyphs, router]);

  const mappedText = useMemo(
    () => mapTextToGlyphs(messageText, glyphs),
    [messageText, glyphs]
  );

  const handleNext = () => {
    if (messageText.trim().length > 0) {
      router.push('/lock');
    }
  };

  const handleBack = () => {
    router.push('/create');
  };

  return (
    <PageTransition className="page-container flex flex-col h-screen overflow-hidden">
      {/* Top Navigation */}
      <header className="flex-none px-6 py-4 flex items-center justify-between border-b border-[var(--border)] bg-bone/80 backdrop-blur-sm z-10">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="text-charcoal-muted hover:text-charcoal transition-colors font-medium cursor-pointer"
          >
            ← Back
          </button>
          <h1 className="text-lg font-bold tracking-tight">Compose Message</h1>
        </div>
        <Button
          variant="primary"
          size="sm"
          onClick={handleNext}
          disabled={!isReady() || messageText.trim().length === 0}
        >
          Lock Message
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0110 0v4"></path>
          </svg>
        </Button>
      </header>

      {/* Split View Content */}
      <main className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
        
        {/* Left Panel: Standard Keyboard Input */}
        <div className="w-full md:w-[45%] lg:w-1/3 h-1/2 md:h-full border-b md:border-b-0 md:border-r border-[var(--border)] bg-bone-light relative">
          <div className="absolute top-4 left-4 z-10 opacity-40 font-mono text-xs uppercase tracking-widest text-charcoal">
            Standard Input
          </div>
          <div className="h-full overflow-y-auto custom-scrollbar pt-12">
            <TextInput 
              value={messageText} 
              onChange={setMessageText} 
            />
          </div>
        </div>

        {/* Right Panel: Custom Glyph Output */}
        <div className="w-full md:flex-1 h-1/2 md:h-full bg-[var(--bone)] relative">
          <div className="absolute top-4 right-4 z-10 opacity-40 font-mono text-xs uppercase tracking-widest text-charcoal">
            Live Preview
          </div>
          <div className="h-full overflow-y-auto custom-scrollbar pt-12 px-2 pb-24">
            <GlyphRenderer mappedText={mappedText} />
          </div>
        </div>
        
      </main>
    </PageTransition>
  );
}
