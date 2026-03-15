'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import React from 'react';

interface ButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const variants = {
  primary:
    'bg-accent text-bone-light hover:bg-accent-hover shadow-sm hover:shadow-md',
  secondary:
    'bg-bone-light text-charcoal border border-[var(--border)] hover:border-[var(--border-active)] hover:shadow-md',
  ghost:
    'bg-transparent text-charcoal-muted hover:text-charcoal hover:bg-[var(--accent-light)]',
};

const sizes = {
  sm: 'px-4 py-2 text-sm rounded-lg',
  md: 'px-6 py-3 text-base rounded-xl',
  lg: 'px-8 py-4 text-lg rounded-xl',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <motion.button
      whileHover={disabled ? {} : { scale: 1.03, y: -1 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className={`
        font-medium tracking-wide cursor-pointer
        transition-colors duration-200
        inline-flex items-center justify-center gap-2
        disabled:opacity-40 disabled:cursor-not-allowed
        ${variants[variant]}
        ${sizes[size]}
        ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
}
