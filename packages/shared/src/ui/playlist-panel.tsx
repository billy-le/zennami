import { useState } from "react";
import type { StationGroup } from "../types/radio-station";

const MOODS = ["focus", "sleep", "study", "morning", "rain"];

interface PlaylistPanelProps {
  groupStations: StationGroup[]
  open: boolean;
  onClose: () => void;
  activeTrackId?: string;
  onSelectTrack: (id: string) => void;
}

export function PlaylistPanel({ groupStations, open, onClose, activeTrackId, onSelectTrack }: PlaylistPanelProps) {
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
          Stations
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
        {groupStations.map((group) => {
          return <div key={group.brandName}>
            <h3 className="text-amber text-xl line-clamp-1">{group.brandName}</h3>
            <ul>
              {group.variants.map((variant, i) => {
                const isActive = variant.station.stationuuid === activeTrackId;
                const tags = variant.station.tags.split(',')
                return (
                  <div
                    key={variant.station.stationuuid}
                    onClick={() => onSelectTrack(variant.station.stationuuid)}
                    className={`flex items-center px-3 py-2.5 rounded-lg cursor-pointer gap-3 transition-colors duration-150 ${isActive ? "bg-sage/25" : "hover:bg-sage/15"
                      }`}
                  >
                    <span
                      className={`text-lg text-right shrink-0 ${isActive ? "text-amber bg-amber/50" : "text-fog"}`}
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {isActive ? "▶" : i + 1}
                    </span>
                    <div className="flex-1 overflow-hidden">
                      <div
                        className={`text-xl font-light italic whitespace-nowrap overflow-hidden text-ellipsis ${isActive ? "text-amber" : "text-cream"
                          }`}
                      >
                        {variant.station.name}
                      </div>
                      <div
                        className="text-sm text-fog tracking-wide mt-0.5"
                        style={{ fontFamily: "var(--font-mono)" }}
                      >
                        {variant.station.tags}
                      </div>
                    </div>
                    <span
                      className="text-xs text-fog shrink-0"
                      style={{ fontFamily: "var(--font-mono)" }}
                    >
                      {variant.station.codec}
                      {' '}{variant.station.bitrate != 0 ? `${variant.station.bitrate}K` : '-'}
                    </span>
                  </div>
                );

              })}
            </ul>
          </div>

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

