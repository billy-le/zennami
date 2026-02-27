import { useState } from "react";
import { Particles } from "./particles";
import { Orb } from "./orb";
import { Waveform } from "./waveform";
import { Controls } from "./controls";
import { PlaylistPanel, TRACKS } from "./playlist-panel";

export function ZenPlayer() {
  const [playing, setPlaying] = useState(true);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [activeTrackId, setActiveTrackId] = useState(1);

  const activeTrack = TRACKS.find((t) => t.id === activeTrackId) ?? TRACKS[0];

  return (
    <div
      className="relative w-90 h-140 overflow-hidden flex flex-col items-center font-display"
      style={{ background: "#1a2318" }}
    >
      {/* Ambient gradient layers */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(74,103,65,0.35) 0%, transparent 70%), radial-gradient(ellipse 60% 40% at 20% 100%, rgba(45,59,46,0.5) 0%, transparent 60%), radial-gradient(ellipse 50% 50% at 80% 80%, rgba(26,35,24,0.8) 0%, transparent 70%)",
        }}
      />

      {/* Grain overlay */}
      <div
        className="absolute inset-0 z-1 opacity-5 pointer-events-none"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E\")",
          backgroundSize: "200px 200px",
        }}
      />

      <Particles />

      {/* Player content */}
      <div className="relative z-10 w-full h-full flex flex-col items-center px-6 pt-7 pb-5.5">
        {/* Header */}
        <div className="w-full flex justify-between items-center mb-6">
          <span
            className="text-[11px] tracking-[0.35em] uppercase text-fog"
            style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}
          >
            Zen Nami
          </span>
          <div
            className="size-1.75 bg-amber rounded-full animate-pulse-dot"
            style={{ boxShadow: "0 0 8px #c9a96e" }}
          />
        </div>

        <Orb />

        {/* Track info */}
        <div className="text-center mb-5 w-full">
          <div className="text-xl font-light italic text-cream tracking-[0.02em] mb-1 whitespace-nowrap overflow-hidden text-ellipsis">
            {activeTrack.title}
          </div>
          <div
            className="text-[11px] text-fog tracking-[0.2em] uppercase"
            style={{ fontFamily: "var(--font-mono)", fontWeight: 300 }}
          >
            {activeTrack.artist}
          </div>
        </div>

        <Waveform playing={playing} />

        {/* Progress bar */}
        <div className="w-full mb-5">
          <div className="w-full h-0.5 bg-mist/20 rounded-sm relative cursor-pointer mb-2">
            <div
              className="h-full w-[38%] rounded-sm relative"
              style={{ background: "linear-gradient(to right, #4a6741, #c9a96e)" }}
            >
              <div
                className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-2 bg-amber rounded-full"
                style={{ boxShadow: "0 0 8px #c9a96e" }}
              />
            </div>
          </div>
          <div
            className="flex justify-between text-[10px] text-fog tracking-[0.05em]"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            <span>1:24</span>
            <span>{activeTrack.duration}</span>
          </div>
        </div>

        <Controls playing={playing} onTogglePlay={() => setPlaying((p) => !p)} />

        {/* Volume + playlist row */}
        <div className="w-full flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1">
            <svg className="text-fog shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
            <div className="flex-1 h-0.5 bg-mist/20 rounded-sm relative cursor-pointer">
              <div
                className="h-full w-[65%] rounded-sm"
                style={{ background: "linear-gradient(to right, #4a6741, rgba(201,169,110,0.7))" }}
              />
            </div>
          </div>
          <button
            onClick={() => setShowPlaylist(true)}
            className="bg-transparent border border-mist/20 rounded-full text-fog cursor-pointer transition-all duration-200 hover:border-amber/40 hover:text-amber whitespace-nowrap px-3 py-1.5 text-[10px] tracking-[0.15em] uppercase"
            style={{ fontFamily: "var(--font-mono)" }}
          >
            Playlist
          </button>
        </div>
      </div>

      {/* Playlist overlay */}
      <PlaylistPanel
        open={showPlaylist}
        onClose={() => setShowPlaylist(false)}
        activeTrackId={activeTrackId}
        onSelectTrack={(id) => {
          setActiveTrackId(id);
          setShowPlaylist(false);
        }}
      />
    </div>
  );
}
