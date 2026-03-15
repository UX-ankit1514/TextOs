'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import PageTransition from '@/components/ui/PageTransition';

export default function LandingPage() {
  const router = useRouter();
  
  // Custom cursor state for main section hover
  const [isHovered, setIsHovered] = useState(false);
  
  // Smooth cursor tracking
  const cursorX = useMotionValue(-100);
  const cursorY = useMotionValue(-100);
  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const cursorXSpring = useSpring(cursorX, springConfig);
  const cursorYSpring = useSpring(cursorY, springConfig);

  useEffect(() => {
    const moveCursor = (e: MouseEvent) => {
      cursorX.set(e.clientX - 12); // center the 24px (w-6 h-6) pointer
      cursorY.set(e.clientY - 12);
    };
    window.addEventListener("mousemove", moveCursor);
    return () => {
      window.removeEventListener("mousemove", moveCursor);
    };
  }, [cursorX, cursorY]);

  const handleClick = () => {
    router.push('/create');
  };

  return (
    <PageTransition className="page-container font-mono text-sm lowercase bg-[#f8f8f8] text-[#333333]">
      {/* Custom Pointer */}
      <motion.div
        className="fixed top-0 left-0 w-6 h-6 rounded-full bg-white mix-blend-difference pointer-events-none z-50 transition-opacity duration-300 shadow-[0_0_15px_rgba(255,255,255,0.4)]"
        style={{
          x: cursorXSpring,
          y: cursorYSpring,
          opacity: isHovered ? 1 : 0,
        }}
      />
      
      <main 
        className="min-h-screen flex flex-col relative overflow-hidden pt-12 pb-24"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Fake Pointer Background Animation (Subtle on light bg) */}
        <motion.div
          className="absolute w-[40vw] h-[40vh] rounded-full bg-teal-500/5 blur-[80px] pointer-events-none"
          animate={{
            x: ["-10vw", "30vw", "-20vw", "10vw", "-10vw"],
            y: ["0vh", "20vh", "-30vh", "30vh", "0vh"],
          }}
          transition={{ duration: 25, repeat: Infinity, repeatType: "mirror", ease: "linear" }}
        />
        <motion.div
          className="absolute w-[50vw] h-[50vh] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none"
          animate={{
            x: ["20vw", "-30vw", "10vw", "-40vw", "20vw"],
            y: ["-20vh", "10vh", "-40vh", "20vh", "-20vh"],
          }}
          transition={{ duration: 35, repeat: Infinity, repeatType: "mirror", ease: "linear" }}
        />

        <div className="flex-1 w-full flex flex-col items-center justify-center relative z-10">
          {/* Marquee Text - Moving left to right */}
          <div className="w-full overflow-hidden relative pointer-events-none select-none flex items-center h-12">
            <motion.div
              className="flex whitespace-nowrap absolute"
              animate={{ x: ["-50%", "0%"] }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              {[...Array(20)].map((_, i) => (
                <span key={i} className="pr-8 text-[#333333]">
                  write your art.<motion.span
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ duration: 1, repeat: Infinity }}
                  >|</motion.span>
                </span>
              ))}
            </motion.div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="z-10 w-full flex justify-center mb-12">
          <button
            onClick={handleClick}
            onMouseEnter={() => setIsHovered(false)} // hide custom pointer when hovering button
            onMouseLeave={() => setIsHovered(true)}  // show custom pointer again
            className="hover:opacity-60 transition-opacity duration-200 cursor-pointer text-[#333333]"
          >
            start writing
          </button>
        </div>
      </main>
    </PageTransition>
  );
}
