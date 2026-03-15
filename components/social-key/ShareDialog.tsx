'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import { useRouter } from 'next/navigation';

interface ShareDialogProps {
  messageId: string;
}

export default function ShareDialog({ messageId }: ShareDialogProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  
  // Construct the full URL
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const shareUrl = `${baseUrl}/reveal/${messageId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handlePreview = () => {
    router.push(`/reveal/${messageId}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="card w-full max-w-md p-8 flex flex-col gap-6 text-center"
    >
      <div className="w-16 h-16 bg-accent-light rounded-full flex items-center justify-center mx-auto mb-2">
        <svg className="w-8 h-8 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-charcoal tracking-tight mb-2">
          Message Locked
        </h2>
        <p className="text-sm text-charcoal-muted">
          Your custom alphabet and message have been encrypted. Share the link below with your recipient.
        </p>
      </div>

      <div className="relative group mt-2">
        <div className="absolute inset-0 bg-accent-glow rounded-xl blur-md group-hover:blur-lg transition-all duration-300 pointer-events-none" />
        <div className="relative bg-bone border border-[var(--border)] rounded-xl p-1 flex items-center">
          <div className="flex-1 overflow-hidden px-4">
            <p className="truncate font-mono text-sm text-charcoal-soft">
              {shareUrl}
            </p>
          </div>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleCopy}
            className="flex-shrink-0"
          >
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        <Button 
          variant="secondary" 
          onClick={() => router.push('/create')}
          className="flex-1"
        >
          Create New
        </Button>
        <Button 
          variant="primary" 
          onClick={handlePreview}
          className="flex-1"
        >
          Preview Reveal
        </Button>
      </div>
    </motion.div>
  );
}
