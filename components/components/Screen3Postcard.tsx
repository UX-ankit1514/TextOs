import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { DotBackground } from "./DotBackground";

interface Screen3Props {
  alphabetData: Record<string, string>;
  onRestart: () => void;
}

function CustomText({
  text,
  alphabetData,
}: {
  text: string;
  alphabetData: Record<string, string>;
}) {
  return (
    <div className="flex flex-wrap items-end gap-x-1 gap-y-2 p-4">
      {text.split("").map((char, i) => {
        const upper = char.toUpperCase();
        if (char === "\n") {
          return <div key={i} className="w-full h-0" />;
        }
        if (char === " ") {
          return <span key={i} className="inline-block w-6" />;
        }
        if (alphabetData[upper]) {
          return (
            <img
              key={i}
              src={alphabetData[upper]}
              alt={char}
              className="inline-block w-8 h-8 object-contain"
              style={{ imageRendering: "auto" }}
            />
          );
        }
        // Fallback for non-alpha chars (numbers, punctuation)
        return (
          <span
            key={i}
            className="inline-block w-8 h-8 text-center text-[20px] text-black/60"
            style={{ fontFamily: "var(--font-caveat)", lineHeight: "32px" }}
          >
            {char}
          </span>
        );
      })}
    </div>
  );
}

export function Screen3Postcard({ alphabetData, onRestart }: Screen3Props) {
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);
  const postcardRef = useRef<HTMLDivElement>(null);

  const handleSave = useCallback(async () => {
    if (!text.trim()) return;
    setSaving(true);
    try {
      const SCALE = 2;
      const WIDTH = 800;
      const CHAR_SIZE = 32;
      const SPACE_WIDTH = 24;
      const PADDING = 32;
      const LINE_HEIGHT = CHAR_SIZE + 8;
      const HEADER_HEIGHT = 40;
      const FOOTER_HEIGHT = 32;

      // Pre-load all needed letter images
      const loadedImages: Record<string, HTMLImageElement> = {};
      const loadPromises: Promise<void>[] = [];
      const uniqueLetters = new Set(
        text
          .split("")
          .map((c) => c.toUpperCase())
          .filter((c) => alphabetData[c])
      );
      uniqueLetters.forEach((letter) => {
        const promise = new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
            loadedImages[letter] = img;
            resolve();
          };
          img.onerror = () => resolve();
          img.src = alphabetData[letter];
        });
        loadPromises.push(promise);
      });
      await Promise.all(loadPromises);

      // Calculate height by simulating line wrapping
      let cursorX = PADDING;
      let lineCount = 1;
      for (const char of text) {
        if (char === "\n") {
          lineCount++;
          cursorX = PADDING;
          continue;
        }
        const charWidth = char === " " ? SPACE_WIDTH : CHAR_SIZE + 4;
        if (cursorX + charWidth > WIDTH - PADDING) {
          lineCount++;
          cursorX = PADDING;
        }
        cursorX += charWidth;
      }

      const contentHeight = lineCount * LINE_HEIGHT + PADDING * 2;
      const totalHeight = HEADER_HEIGHT + contentHeight + FOOTER_HEIGHT;

      const canvas = document.createElement("canvas");
      canvas.width = WIDTH * SCALE;
      canvas.height = totalHeight * SCALE;
      const ctx = canvas.getContext("2d")!;
      ctx.scale(SCALE, SCALE);

      // Background
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, WIDTH, totalHeight);

      // Header
      ctx.fillStyle = "#f7f7f7";
      ctx.fillRect(0, 0, WIDTH, HEADER_HEIGHT);
      ctx.strokeStyle = "#e8e8e8";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, HEADER_HEIGHT);
      ctx.lineTo(WIDTH, HEADER_HEIGHT);
      ctx.stroke();
      ctx.fillStyle = "#b0b0b0";
      ctx.font = "11px 'Playfair Display', serif";
      ctx.letterSpacing = "3px";
      ctx.fillText("MY HIEROGLYPH POSTCARD", PADDING, 26);

      // Content - render characters
      cursorX = PADDING;
      let cursorY = HEADER_HEIGHT + PADDING;

      for (const char of text) {
        const upper = char.toUpperCase();

        if (char === "\n") {
          cursorY += LINE_HEIGHT;
          cursorX = PADDING;
          continue;
        }

        if (char === " ") {
          cursorX += SPACE_WIDTH;
          if (cursorX > WIDTH - PADDING) {
            cursorY += LINE_HEIGHT;
            cursorX = PADDING;
          }
          continue;
        }

        const charWidth = CHAR_SIZE + 4;
        if (cursorX + charWidth > WIDTH - PADDING) {
          cursorY += LINE_HEIGHT;
          cursorX = PADDING;
        }

        if (loadedImages[upper]) {
          ctx.drawImage(loadedImages[upper], cursorX, cursorY, CHAR_SIZE, CHAR_SIZE);
        } else {
          // Fallback: draw text character
          ctx.fillStyle = "#666666";
          ctx.font = "20px 'Caveat', cursive";
          ctx.fillText(char, cursorX + 6, cursorY + CHAR_SIZE - 6);
        }
        cursorX += charWidth;
      }

      // Footer
      const footerY = totalHeight - FOOTER_HEIGHT;
      ctx.strokeStyle = "#e8e8e8";
      ctx.beginPath();
      ctx.moveTo(0, footerY);
      ctx.lineTo(WIDTH, footerY);
      ctx.stroke();
      ctx.fillStyle = "#cccccc";
      ctx.font = "10px 'Playfair Display', serif";
      const footerText = "Created with Hieroglyph Art";
      const footerWidth = ctx.measureText(footerText).width;
      ctx.fillText(footerText, WIDTH - PADDING - footerWidth, footerY + 20);

      // Download
      const link = document.createElement("a");
      link.download = "my-hieroglyph-postcard.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Save failed:", err);
    } finally {
      setSaving(false);
    }
  }, [text, alphabetData]);

  const hasLetters = Object.values(alphabetData).some((v) => v);

  return (
    <DotBackground>
      <motion.div
        className="w-full max-w-[1000px] px-4 flex flex-col items-center"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h2
          className="text-[24px] text-black/50 mb-6"
            style={{ fontFamily: "var(--font-playfair)", fontWeight: 700 }}
        >
          Save your post
        </h2>

        {/* Typing area */}
        <div className="w-full mb-4">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type your letter, poem, or message here..."
            className="w-full h-32 bg-[#f5f5f5] border border-black/10 rounded-[5px] p-4 text-[16px] text-black/70 resize-none focus:outline-none focus:border-black/30 transition-colors"
            style={{ fontFamily: "var(--font-caveat)" }}
          />
        </div>

        {/* Postcard preview */}
        <div
          ref={postcardRef}
          className="w-full min-h-[200px] bg-white border border-black/10 rounded-[5px] mb-6 overflow-hidden"
        >
          {/* Postcard header */}
          <div className="bg-gradient-to-r from-black/5 to-transparent px-6 py-3 border-b border-black/5">
            <p
              className="text-[12px] text-black/30 tracking-widest uppercase"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              My Hieroglyph Postcard
            </p>
          </div>

          {/* Rendered custom text */}
          <div className="p-4 min-h-[140px]">
            {text ? (
              <CustomText text={text} alphabetData={alphabetData} />
            ) : (
              <p className="text-black/20 text-center py-12 text-[14px]">
                {hasLetters
                  ? "Start typing above to see your custom alphabet in action..."
                  : "No letters drawn yet. Go back and create your alphabet first!"}
              </p>
            )}
          </div>

          {/* Postcard footer */}
          <div className="border-t border-black/5 px-6 py-2 flex justify-end">
            <p
              className="text-[10px] text-black/20"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Created with Hieroglyph Art
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between w-full">
          <motion.button
            onClick={onRestart}
            className="bg-white border border-black/10 rounded-[5px] px-6 py-2.5 text-[20px] text-black/50 hover:text-black/70 hover:border-black/30 transition-all"
              style={{ fontFamily: "var(--font-playfair)", fontWeight: 700 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
          >
            Restart
          </motion.button>

          <motion.button
            onClick={handleSave}
            disabled={!text.trim() || saving}
            className="bg-white border border-black/10 rounded-[5px] px-8 py-2.5 text-[20px] text-black/50 hover:text-black/70 hover:border-black/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ fontFamily: "var(--font-playfair)", fontWeight: 700 }}
            whileHover={text.trim() ? { scale: 1.03 } : {}}
            whileTap={text.trim() ? { scale: 0.97 } : {}}
          >
            {saving ? "Saving..." : "Save"}
          </motion.button>
        </div>
      </motion.div>
    </DotBackground>
  );
}