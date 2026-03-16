'use client';

import * as React from "react";
import { motion } from "framer-motion";
import { DotBackground } from "./DotBackground";

interface Screen1Props {
  onStart: () => void;
}

export function Screen1Landing({ onStart }: Screen1Props) {
  return (
    <DotBackground>
      <style>{`
        @keyframes typing {
          0% { width: 0ch; }
          50% { width: 14ch; }
          100% { width: 14ch; }
        }
        @keyframes blink {
          50% { border-color: transparent; }
        }
      `}</style>
      <motion.div
        className="cursor-pointer select-none flex items-center gap-0"
        onClick={onStart}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.97 }}
      >
        <p
          className="text-[24px] text-black/60 whitespace-nowrap overflow-hidden"
          style={{
            fontFamily: "var(--font-caveat)",
            borderRight: "2px solid rgba(0,0,0,0.6)",
            animation: "typing 3s steps(14) infinite, blink 0.6s step-end infinite",
            width: "max-content",
          }}
        >
          Write your art
        </p>
      </motion.div>
    </DotBackground>
  );
}

export default Screen1Landing;