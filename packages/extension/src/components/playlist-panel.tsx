import { useState } from "react";
import { IoCloseSharp, IoPlaySharp } from 'react-icons/io5'
import { Waveform } from "./waveform";
import { usePlayerState } from "@/state/player";

const MOODS = ["focus", "sleep", "study", "morning", "rain"];

interface PlaylistPanelProps {
  open: boolean;
  onClose: () => void;
}

export function PlaylistPanel({ open, onClose }: PlaylistPanelProps) {
  const isPlaying = usePlayerState(state => state.isPlaying)
  const activeStationId = usePlayerState(state => state.currentStation?.stationuuid)
  const setRadioStation = usePlayerState(state => state.setRadioStation)
  const [activeMood, setActiveMood] = useState("focus");
  const { data: groupStations = [] } = useGroupStations()

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
          <IoCloseSharp />
        </button>
      </div>

      {/* Track list */}
      <div className="flex flex-col gap-0.5 overflow-y-auto flex-1 scrollbar-thin">
        {groupStations.map((group) => {
          const oneStation = group.variants.length === 1;
          if (oneStation) {
            const station = group.variants[0]!.station
            const isActive = station.stationuuid === activeStationId;
            const tags = station.tags.split(',')

            return <div
              key={station.stationuuid}
              onClick={() => {
                setRadioStation(station)
                onClose()
              }}
              className={`flex px-3 py-2.5 rounded-lg cursor-pointer gap-3 transition-colors duration-150 ${isActive ? "bg-sage/25" : "hover:bg-sage/15"
                }`}
            >
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center justify-between">
                  <div
                    className={`text-xl font-light italic whitespace-nowrap overflow-hidden text-ellipsis ${isActive ? "text-amber" : "text-cream"
                      }`}
                  >
                    <span
                      className={`mr-2 text-sm font-mono shrink-0 ${isActive ? "text-amber" : "text-fog"}`}
                    >
                      {isActive && <IoPlaySharp className="inline" />}
                    </span>
                    {station.name}
                  </div>
                  {isActive && <Waveform playing={isPlaying} />}
                </div>
                <div
                  className="text-sm text-fog tracking-wide mt-0.5 line-clamp-2 font-mono"
                >
                  {tags.join(', ')}
                </div>
                <div
                  className="font-mono text-xs text-fog shrink-0 mt-1"
                >
                  {station.codec}
                  {' '}{station.bitrate != 0 ? `${station.bitrate}K` : ''}
                </div>
              </div>
            </div>
          }


          return <div key={group.brandName}>
            <h3 className="mt-5 text-amber text-xl line-clamp-1"><span className="font-mono text-sm">({group.variants.length})</span> {group.brandName}</h3>
            <ul>
              {group.variants.map((variant, i) => {
                const isActive = variant.station.stationuuid === activeStationId;
                const tags = variant.station.tags.split(',')
                return (
                  <div
                    key={variant.station.stationuuid}
                    onClick={() => {
                      setRadioStation(variant.station)
                      onClose()
                    }}
                    className={`flex px-3 py-2.5 rounded-lg cursor-pointer gap-3 transition-colors duration-150 ${isActive ? "bg-sage/25" : "hover:bg-sage/15"
                      }`}
                  >
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <div
                          className={`text-xl font-light italic whitespace-nowrap overflow-hidden text-ellipsis ${isActive ? "text-amber" : "text-cream"
                            }`}
                        >
                          <span
                            className={`mr-2 text-sm font-mono shrink-0 ${isActive ? "text-amber" : "text-fog"}`}
                          >
                            {isActive ? <IoPlaySharp className="inline" /> : i + 1}
                          </span>
                          {variant.station.name}
                        </div>
                        {isActive && <Waveform playing={isPlaying} />}
                      </div>
                      <div
                        className="text-sm text-fog tracking-wide mt-0.5 line-clamp-2 font-mono"
                      >
                        {tags.join(', ')}
                      </div>
                      <div
                        className="font-mono text-xs text-fog shrink-0 mt-1"
                      >
                        {variant.station.codec}
                        {' '}{variant.station.bitrate != 0 ? `${variant.station.bitrate}K` : ''}
                      </div>
                    </div>
                  </div>
                )
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

