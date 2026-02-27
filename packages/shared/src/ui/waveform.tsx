import { useMemo } from "react";

interface Bar {
  id: number;
  minH: number;
  maxH: number;
  spd: string;
  dly: string;
}

interface WaveformProps {
  playing: boolean;
}

export function Waveform({ playing }: WaveformProps) {
  const bars = useMemo<Bar[]>(() => {
    return Array.from({ length: 40 }, (_, i) => {
      const minH = 4 + Math.random() * 8;
      const maxH = minH + 10 + Math.random() * 18;
      return {
        id: i,
        minH,
        maxH,
        spd: `${0.6 + Math.random() * 1.2}s`,
        dly: `${Math.random() * 1.5}s`,
      };
    });
  }, []);

  return (
    <div className="w-full h-9 flex items-center justify-center gap-[2.5px] mb-5">
      {bars.map((bar) => (
        <div
          key={bar.id}
          className="w-0.75 rounded-sm opacity-70 animate-wave"
          style={{
            height: bar.minH,
            background: "linear-gradient(to top, #4a6741, #c9a96e)",
            animationPlayState: playing ? "running" : "paused",
            "--min-h": `${bar.minH}px`,
            "--max-h": `${bar.maxH}px`,
            "--spd": bar.spd,
            "--dly": bar.dly,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
