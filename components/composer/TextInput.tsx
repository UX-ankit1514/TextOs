'use client';

import React, { useRef, useEffect } from 'react';

interface TextInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export default function TextInput({
  value,
  onChange,
  placeholder = "Type your message...",
  autoFocus = true,
}: TextInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea logic
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto'; // Reset
      textarea.style.height = `${Math.max(textarea.scrollHeight, 100)}px`;
    }
  }, [value]);

  useEffect(() => {
    if (autoFocus && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [autoFocus]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // We only accept valid A-Z, numbers, basic punctuation, spaces and newlines
    const rawVal = e.target.value;
    // Simple filter to keep things clean
    const filtered = rawVal.replace(/[^a-zA-Z0-9\s.,!?'"()-]/g, '');
    onChange(filtered);
  };

  return (
    <div className="w-full relative min-h-[50vh]">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full h-full min-h-[200px] resize-none border-none outline-none 
                   bg-transparent text-charcoal-muted leading-relaxed font-mono text-lg
                   placeholder:text-charcoal-muted/30 p-4"
        spellCheck="false"
        autoComplete="off"
        data-gramm="false" // Disable Grammarly
      />
    </div>
  );
}
