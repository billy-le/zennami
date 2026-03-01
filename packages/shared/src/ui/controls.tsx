interface ControlsProps {
  playing: boolean;
  onTogglePlay: () => void;
  onNextStation: () => void;
  onPrevStation: () => void;
}

export function Controls({ playing, onTogglePlay, onPrevStation, onNextStation }: ControlsProps) {
  return (
    <div className="flex items-center justify-center gap-7 mb-6">
      <CtrlBtn aria-label="Previous" onClick={onPrevStation}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 6h2v12H6zm3.5 6 8.5 6V6z" />
        </svg>
      </CtrlBtn>

      <button
        aria-label={playing ? "Pause" : "Play"}
        onClick={onTogglePlay}
        className="size-13 rounded-full flex items-center justify-center text-cream border border-amber/30 cursor-pointer transition-all duration-300 hover:border-amber/50 hover:scale-105"
        style={{
          background: "linear-gradient(135deg, rgba(74,103,65,0.6), rgba(45,59,46,0.8))",
          boxShadow: "0 0 20px rgba(74,103,65,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        {playing ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 19h4V5H6v14zm8-14v14l11-7-11-7z" />
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      <CtrlBtn aria-label="Next" onClick={onNextStation}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6 18l8.5-6L6 6v12zm2.5-6 6 4.3V7.7l-6 4.3zM16 6h2v12h-2z" />
        </svg>
      </CtrlBtn>
    </div>
  );
}

function CtrlBtn({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className="bg-transparent border-none cursor-pointer text-mist opacity-60 flex items-center justify-center p-1 transition-all duration-200 hover:opacity-100 hover:scale-110"
    >
      {children}
    </button>
  );
}
