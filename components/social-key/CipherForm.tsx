'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';

interface CipherFormProps {
  onEncrypt: (hint: string, password: string) => void;
  isEncrypting: boolean;
}

export default function CipherForm({ onEncrypt, isEncrypting }: CipherFormProps) {
  const [hint, setHint] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!hint.trim()) {
      setError('A hint is required so the recipient can guess the password.');
      return;
    }
    
    if (password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    onEncrypt(hint.trim(), password);
  };

  return (
    <motion.form 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="card w-full max-w-md p-8 flex flex-col gap-6"
      onSubmit={handleSubmit}
    >
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold text-charcoal tracking-tight mb-2">
          Lock Your Message
        </h2>
        <p className="text-sm text-charcoal-muted">
          Your glyphs will be encrypted with AES-256. Only someone with the password can reveal the true message.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-100 text-red-600 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* Hint Field */}
      <div className="flex flex-col gap-2">
        <label htmlFor="hint" className="text-sm font-semibold text-charcoal">
          Password Hint
        </label>
        <textarea
          id="hint"
          value={hint}
          onChange={(e) => setHint(e.target.value)}
          placeholder="e.g. The nickname you gave me in high school"
          className="w-full px-4 py-3 bg-bone border border-[var(--border)] rounded-lg 
                     focus:border-accent focus:ring-1 focus:ring-accent outline-none 
                     transition-shadow resize-none h-24 text-sm"
          disabled={isEncrypting}
        />
        <span className="text-xs text-charcoal-muted self-end mt-1">
          {hint.length}/100
        </span>
      </div>

      {/* Password Fields */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="password" className="text-sm font-semibold text-charcoal">
            Secret Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-bone border border-[var(--border)] rounded-lg 
                       focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-shadow"
            disabled={isEncrypting}
          />
        </div>

        <div className="flex flex-col gap-2">
          <input
            id="confirm"
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirm password"
            className="w-full px-4 py-3 bg-bone border border-[var(--border)] rounded-lg 
                       focus:border-accent focus:ring-1 focus:ring-accent outline-none transition-shadow"
            disabled={isEncrypting}
          />
        </div>
      </div>

      <Button
        type="submit"
        variant="primary"
        className="mt-4 w-full"
        disabled={isEncrypting || !hint || !password || !confirm}
      >
        {isEncrypting ? 'Encrypting...' : 'Lock & Generate URL'}
      </Button>
    </motion.form>
  );
}
