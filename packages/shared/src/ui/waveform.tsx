import { useMemo } from "react";

interface Bar {
  id: number;
  /** Static rendered height — never changes, so no layout reflow occurs */
  baseH: number;
  /**
   * scaleY values instead of pixel heights.
   * The bar is always `baseH` tall in the DOM; we only change how much
   * of that height is visible via scaleY, which is compositor-only.
   */
  minScale: number;
  maxScale: number;
  spd: string;
  dly: string;
}

interface WaveformProps {
  playing: boolean;
}

export function Waveform({ playing }: WaveformProps) {
  const bars = useMemo<Bar[]>(() => {
    return Array.from({ length: 40 }, (_, i) => {
      /**
       * Pick a fixed rendered height for each bar. This becomes the
       * element's actual CSS height and never changes — eliminating
       * the per-frame height reflow that caused the frame drops.
       *
       * The visual "short → tall" waveform effect is recreated by
       * animating scaleY between minScale and maxScale instead.
       */
      const baseH = 28;
      const minScale = 0.15 + Math.random() * 0.2; // ~4–9 px visible
      const maxScale = 0.55 + Math.random() * 0.45; // ~15–28 px visible

      return {
        id: i,
        baseH,
        minScale,
        maxScale,
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
            /**
             * height is now static — the DOM never recalculates layout
             * for these elements during animation.
             */
            height: bar.baseH,
            background: "linear-gradient(to top, #4a6741, #c9a96e)",
            animationPlayState: playing ? "running" : "paused",
            "--min-scale": bar.minScale,
            "--max-scale": bar.maxScale,
            "--spd": bar.spd,
            "--dly": bar.dly,
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
}
