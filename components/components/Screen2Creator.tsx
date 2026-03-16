import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { DotBackground } from "./DotBackground";
import { LetterCanvas } from "./LetterCanvas";

const ALPHABET_ROW1 = "ABCDEFGHIJKLM".split("");
const ALPHABET_ROW2 = "NOPQRSTUVWXYZ".split("");

interface Screen2Props {
  alphabetData: Record<string, string>;
  onUpdateLetter: (letter: string, dataUrl: string) => void;
  onEnter: () => void;
  onBack: () => void;
}

export function Screen2Creator({
  alphabetData,
  onUpdateLetter,
  onEnter,
  onBack,
}: Screen2Props) {
  const [drawnCount, setDrawnCount] = useState(
    Object.values(alphabetData).filter((v) => v).length
  );

  const handleDrawn = (letter: string, dataUrl: string) => {
    onUpdateLetter(letter, dataUrl);
    const newCount = Object.values({ ...alphabetData, [letter]: dataUrl }).filter(
      (v) => v
    ).length;
    setDrawnCount(newCount);
  };

  return (
    <DotBackground>
      <motion.div
        className="w-full max-w-[1300px] px-4 flex flex-col items-center relative"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Back button */}
        <button
          onClick={onBack}
          className="absolute top-0 left-4 p-2 text-black/30 hover:text-black/60 transition-colors cursor-pointer"
          aria-label="Go back"
        >
          <ArrowLeft size={20} strokeWidth={1.5} />
        </button>

        <h2
          className="text-[24px] text-black/50 mb-2"
          style={{ fontFamily: "var(--font-playfair)", fontWeight: 700 }}
        >
          Create your alphabet
        </h2>
        <p className="text-[13px] text-black/30 mb-6">
          Draw each letter with your mouse or pen ({drawnCount}/26 completed)
        </p>

        {/* Row 1: A-M */}
        <div className="flex flex-wrap justify-center gap-3 mb-4">
          {ALPHABET_ROW1.map((letter) => (
            <motion.div
              key={letter}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: ALPHABET_ROW1.indexOf(letter) * 0.03 }}
            >
              <LetterCanvas
                letter={letter}
                onDrawn={handleDrawn}
                existingData={alphabetData[letter]}
              />
            </motion.div>
          ))}
        </div>

        {/* Row 2: N-Z */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {ALPHABET_ROW2.map((letter) => (
            <motion.div
              key={letter}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: (ALPHABET_ROW2.indexOf(letter) + 13) * 0.03,
              }}
            >
              <LetterCanvas
                letter={letter}
                onDrawn={handleDrawn}
                existingData={alphabetData[letter]}
              />
            </motion.div>
          ))}
        </div>

        {/* Enter CTA */}
        <div className="w-full flex justify-end mx-[70px] my-[0px] pl-[29px] pr-[138px] py-[0px]">
          <button
            onClick={onEnter}
            disabled={drawnCount === 0}
            className="flex items-center gap-1.5 text-black/40 hover:text-black/70 disabled:text-black/15 disabled:cursor-not-allowed transition-colors cursor-pointer bg-white border border-black/10 rounded-md px-4 py-2 text-[#00000080] text-[14px]"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Enter
            <ArrowRight size={14} strokeWidth={1.5} />
          </button>
        </div>
      </motion.div>
    </DotBackground>
  );
}