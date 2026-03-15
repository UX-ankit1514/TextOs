'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import PageTransition from '@/components/ui/PageTransition';
import CipherDisplay from '@/components/reveal/CipherDisplay';
import PasswordGate from '@/components/reveal/PasswordGate';
import RevealAnimation from '@/components/reveal/RevealAnimation';
import ExportPanel from '@/components/export/ExportPanel';
import { decryptMessage } from '@/lib/crypto';
import type { MessagePayload, EncryptedMessage } from '@/types/glyph';
import { mapTextToGlyphs } from '@/components/composer/GlyphMapper';

export default function RevealPage() {
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [encryptedData, setEncryptedData] = useState<EncryptedMessage | null>(null);
  const [decryptedPayload, setDecryptedPayload] = useState<MessagePayload | null>(null);
  
  // State machine: 'locked' -> 'decrypting' -> 'revealing' -> 'complete'
  const [revealState, setRevealState] = useState<'locked' | 'decrypting' | 'revealing' | 'complete'>('locked');
  const [passwordError, setPasswordError] = useState('');

  // Container ref for Postcard Export
  const printRef = useRef<HTMLDivElement>(null);

  // Fetch encrypted payload on mount
  useEffect(() => {
    async function fetchMessage() {
      try {
        const res = await fetch(`/api/message/${id}`);
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        setEncryptedData(data.message);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchMessage();
  }, [id]);

  const handleUnlock = (password: string) => {
    if (!encryptedData) return;
    
    setRevealState('decrypting');
    setPasswordError('');

    // Simulate slight delay for dramatic effect
    setTimeout(() => {
      const payload = decryptMessage(encryptedData.ciphertext, password);
      
      if (payload) {
        setDecryptedPayload(payload);
        setRevealState('revealing');
      } else {
        setPasswordError('Incorrect password. Try again.');
        setRevealState('locked');
      }
    }, 800);
  };

  const handleRevealComplete = () => {
    setRevealState('complete');
  };

  // Derive message stats for the cipher display
  const messageStats = useMemo(() => {
    if (!encryptedData) return { length: 0, words: [] };
    
    // We don't know the actual length, so we estimate based on ciphertext length
    // A more secure implementation would include this metadata outside encryption
    // For MVP, if we don't have it, we just generate a random block
    const estimatedChars = Math.max(10, Math.floor(encryptedData.ciphertext.length / 50));
    const words = [5, 3, 7, 4, 6]; // Pseudo-random word lengths
    
    return { length: estimatedChars, words };
  }, [encryptedData]);

  // Derive mapped glyphs once decrypted
  const mappedText = useMemo(() => {
    if (!decryptedPayload) return [];
    return mapTextToGlyphs(decryptedPayload.text, decryptedPayload.glyphs);
  }, [decryptedPayload]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bone">
        <motion.div 
          animate={{ rotate: 360 }} 
          transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          className="w-12 h-12 border-4 border-[var(--border)] border-t-accent rounded-full" 
        />
      </div>
    );
  }

  if (!encryptedData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-bone p-4 text-center">
        <h1 className="text-2xl font-bold text-charcoal mb-2">Message Not Found</h1>
        <p className="text-charcoal-muted">This message may have expired or the link is invalid.</p>
      </div>
    );
  }

  return (
    <PageTransition className={`page-container min-h-screen transition-colors duration-1000 ${
      revealState === 'locked' || revealState === 'decrypting' ? 'bg-charcoal' : 'bg-bone'
    }`}>
      <main className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-4 sm:p-8 lg:p-16">
        
        {/* The core display area (used for export as well) */}
        <div 
          ref={printRef}
          className={`w-full max-w-5xl transition-opacity duration-500 ${
            revealState === 'complete' ? 'opacity-100' : ''
          }`}
        >
          <AnimatePresence mode="wait">
            {(revealState === 'locked' || revealState === 'decrypting') ? (
              <motion.div
                key="cipher"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, filter: 'blur(10px)', scale: 1.05 }}
                transition={{ duration: 0.8 }}
              >
                <CipherDisplay 
                  messageLength={messageStats.length} 
                  wordLengths={messageStats.words} 
                />
              </motion.div>
            ) : (
              <motion.div
                key="reveal"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="w-full"
              >
                <RevealAnimation 
                  mappedText={mappedText} 
                  onComplete={handleRevealComplete} 
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Password Gate UI */}
        <AnimatePresence>
          {(revealState === 'locked' || revealState === 'decrypting') && (
            <PasswordGate 
              hint={encryptedData.hint} 
              onUnlock={handleUnlock}
              error={passwordError}
              isLoading={revealState === 'decrypting'}
            />
          )}
        </AnimatePresence>

        {/* Export Engine Panel */}
        <AnimatePresence>
          {revealState === 'complete' && decryptedPayload && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="mt-16 w-full max-w-2xl"
            >
              <ExportPanel 
                glyphs={decryptedPayload.glyphs} 
                printRef={printRef} 
              />
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </PageTransition>
  );
}
