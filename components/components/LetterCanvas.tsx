import { useRef, useEffect, useState, useCallback } from "react";

interface LetterCanvasProps {
  letter: string;
  onDrawn: (letter: string, dataUrl: string) => void;
  existingData?: string;
}

export function LetterCanvas({ letter, onDrawn, existingData }: LetterCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(!!existingData);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = 128;
    canvas.height = 128;

    if (existingData) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
      };
      img.src = existingData;
    } else {
      ctx.fillStyle = "#e9e9e9";
      ctx.fillRect(0, 0, 128, 128);
    }
  }, [existingData]);

  const getPos = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const scaleX = 128 / rect.width;
    const scaleY = 128 / rect.height;

    if ("touches" in e) {
      const touch = e.touches[0];
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  const startDraw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear to white on first draw
    if (!hasDrawn) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, 128, 128);
      setHasDrawn(true);
    }

    setIsDrawing(true);
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
  }, [getPos, hasDrawn]);

  const draw = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
  }, [isDrawing, getPos]);

  const endDraw = useCallback(() => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL("image/png");
    onDrawn(letter, dataUrl);
  }, [isDrawing, letter, onDrawn]);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#e9e9e9";
    ctx.fillRect(0, 0, 128, 128);
    setHasDrawn(false);
    onDrawn(letter, "");
  }, [letter, onDrawn]);

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-16 h-16 rounded-[5px] border border-black/10 cursor-crosshair touch-none"
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
        {hasDrawn && (
          <button
            onClick={clearCanvas}
            className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center text-white text-[8px] transition-colors"
            title="Clear"
          >
            x
          </button>
        )}
      </div>
      <p
        className="text-[14px] text-black/50"
        style={{ fontFamily: "Inter, sans-serif", fontWeight: 700 }}
      >
        {letter}
      </p>
    </div>
  );
}
