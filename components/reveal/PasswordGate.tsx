'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';

interface PasswordGateProps {
  hint: string;
  onUnlock: (password: string) => void;
  error?: string;
  isLoading?: boolean;
}

export default function PasswordGate({ hint, onUnlock, error, isLoading }: PasswordGateProps) {
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.trim()) {
      onUnlock(password);
    }
  };

  return (
    <motion.form 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 30 }}
      className="card w-full max-w-sm p-6 absolute bottom-12 md:bottom-24 left-1/2 -translate-x-1/2 z-20 backdrop-blur-xl bg-bone/90"
      onSubmit={handleSubmit}
    >
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm tracking-wider uppercase">
        Locked
      </div>

      <div className="text-center mt-2 mb-6">
        <h3 className="text-lg font-bold text-charcoal mb-1">Enter Password</h3>
        <p className="text-xs text-charcoal-muted uppercase tracking-widest font-mono">
          Hint: {hint}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className={`w-full px-4 py-3 bg-white border ${
            error ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : 'border-[var(--border)] focus:border-accent focus:ring-accent'
          } rounded-lg outline-none transition-shadow text-center tracking-widest`}
          autoFocus
          disabled={isLoading}
        />
        
        {error && (
          <motion.p 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="text-xs text-red-500 text-center"
          >
            {error}
          </motion.p>
        )}

        <Button 
          type="submit" 
          variant="primary" 
          className="w-full"
          disabled={!password || isLoading}
        >
          {isLoading ? 'Decrypting...' : 'Unlock'}
        </Button>
      </div>
    </motion.form>
  );
}
