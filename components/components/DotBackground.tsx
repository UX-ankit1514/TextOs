export function DotBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative w-full min-h-screen overflow-hidden bg-white">
      {/* Dot pattern background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(0,0,0,0.08) 8px, transparent 8px)",
          backgroundSize: "48px 48px",
          backgroundPosition: "24px 24px",
        }}
      />
      {/* Radial fade overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(255,255,255,0.9) 0%, rgba(241,241,241,0.3) 100%)",
        }}
      />
      <div className="relative z-10 w-full min-h-screen flex flex-col items-center justify-center">
        {children}
      </div>
    </div>
  );
}
