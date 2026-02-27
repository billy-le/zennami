import { useMemo } from "react";

interface Particle {
  id: number;
  left: string;
  top: string;
  dur: string;
  delay: string;
  drift: string;
}

export function Particles() {
  const particles = useMemo<Particle[]>(() => {
    return Array.from({ length: 18 }, (_, i) => ({
      id: i,
      left: `${10 + Math.random() * 80}%`,
      top: `${20 + Math.random() * 80}%`,
      dur: `${4 + Math.random() * 6}s`,
      delay: `${Math.random() * 8}s`,
      drift: `${(Math.random() - 0.5) * 40}px`,
    }));
  }, []);

  return (
    <div className="absolute inset-0 z-1 pointer-events-none">
      {particles.map((p) => (
        <div
          key={p.id}
          className="absolute w-0.5 h-0.5 bg-amber rounded-full opacity-0 animate-float-up"
          style={{
            left: p.left,
            top: p.top,
            "--dur": p.dur,
            "--delay": p.delay,
            "--drift": p.drift,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
