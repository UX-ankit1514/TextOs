'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PageTransition from '@/components/ui/PageTransition';
import CipherForm from '@/components/social-key/CipherForm';
import ShareDialog from '@/components/social-key/ShareDialog';
import { useGlyphStore } from '@/lib/glyph-store';
import { createEncryptedMessage } from '@/lib/crypto';
import type { MessagePayload } from '@/types/glyph';

export default function LockPage() {
  const router = useRouter();
  const { glyphs, messageText, isReady } = useGlyphStore();
  
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [messageId, setMessageId] = useState<string | null>(null);

  // Redirect if no message
  useEffect(() => {
    if (!isReady()) {
      router.replace('/compose');
    }
  }, [isReady, router]);

  const handleEncrypt = async (hint: string, password: string) => {
    setIsEncrypting(true);
    
    try {
      // 1. Prepare payload
      const payload: MessagePayload = {
        text: messageText,
        glyphs,
        hint,
        createdAt: Date.now()
      };
      
      // 2. Encrypt
      const encryptedMessage = createEncryptedMessage(payload, password);
      
      // 3. Save to server
      const response = await fetch('/api/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(encryptedMessage),
      });
      
      if (!response.ok) throw new Error('Failed to save message');
      
      const data = await response.json();
      setMessageId(data.id);
      
    } catch (error) {
      console.error('Encryption failed:', error);
      alert('Failed to lock message. Please try again.');
    } finally {
      setIsEncrypting(false);
    }
  };

  return (
    <PageTransition className="page-container min-h-screen flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-charcoal/5 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full flex justify-center">
        {!messageId ? (
          <CipherForm onEncrypt={handleEncrypt} isEncrypting={isEncrypting} />
        ) : (
          <ShareDialog messageId={messageId} />
        )}
      </div>

      <button
        onClick={() => router.back()}
        className="absolute top-8 left-8 text-charcoal-muted hover:text-charcoal transition-colors font-medium z-20"
      >
        ← Back to Composer
      </button>
    </PageTransition>
  );
}
