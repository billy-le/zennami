import { useState } from "react";
import type { RadioStation } from "../types/radio-station";

const MOODS = ["focus", "sleep", "study", "morning", "rain"];

interface PlaylistPanelProps {
  stations: RadioStation[]
  open: boolean;
  onClose: () => void;
  activeTrackId: string;
  onSelectTrack: (id: string) => void;
}

export function PlaylistPanel({ stations, open, onClose, activeTrackId, onSelectTrack }: PlaylistPanelProps) {
  const [activeMood, setActiveMood] = useState("focus");

  return (
    <div
      className={`absolute inset-0 z-20 flex flex-col p-7 transition-all duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      style={{ background: "rgba(15, 21, 14, 0.97)", backdropFilter: "blur(10px)" }}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <span
          className="text-[11px] tracking-[0.3em] uppercase text-fog"
          style={{ fontFamily: "var(--font-mono)" }}
        >
          Queue
        </span>
        <button
          onClick={onClose}
          className="bg-transparent border-none text-fog opacity-60 cursor-pointer text-lg leading-none transition-opacity hover:opacity-100"
        >
          ✕
        </button>
      </div>

      {/* Track list */}
      <div className="flex flex-col gap-0.5 overflow-y-auto flex-1 scrollbar-thin">
        {stations.map((track, i) => {
          const isActive = track.stationuuid === activeTrackId;
          return (
            <div
              key={track.stationuuid}
              onClick={() => onSelectTrack(track.stationuuid)}
              className={`flex items-center px-3 py-2.5 rounded-lg cursor-pointer gap-3 transition-colors duration-150 ${isActive ? "bg-sage/25" : "hover:bg-sage/15"
                }`}
            >
              <span
                className={`text-[10px] w-4 text-right shrink-0 ${isActive ? "text-amber" : "text-fog"}`}
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {isActive ? "▶" : i + 1}
              </span>
              <div className="flex-1 overflow-hidden">
                <div
                  className={`text-sm font-light italic whitespace-nowrap overflow-hidden text-ellipsis ${isActive ? "text-amber" : "text-cream"
                    }`}
                >
                  {track.name}
                </div>
                <div
                  className="text-[9px] text-fog tracking-widest mt-0.5"
                  style={{ fontFamily: "var(--font-mono)" }}
                >
                  {track.tags}
                </div>
              </div>
              <span
                className="text-[10px] text-fog shrink-0"
                style={{ fontFamily: "var(--font-mono)" }}
              >
                {track.codec}
              </span>
            </div>
          );
        })}
      </div>

      {/* Mood tags */}
      <div className="flex gap-1.5 mt-5 flex-wrap">
        {MOODS.map((mood) => (
          <button
            key={mood}
            onClick={() => setActiveMood(mood)}
            className={`px-2.5 py-1 rounded-full border text-[9px] tracking-[0.15em] uppercase cursor-pointer transition-all duration-200 ${activeMood === mood
              ? "border-amber/50 text-amber bg-amber/8"
              : "border-mist/25 text-fog hover:border-amber/40 hover:text-amber"
              }`}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {mood}
          </button>
        ))}
      </div>
    </div>
  );
}

