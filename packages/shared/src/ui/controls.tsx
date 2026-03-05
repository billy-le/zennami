import {
  IoPlaySharp, IoPauseSharp, IoPlaySkipForwardSharp, IoPlaySkipBackSharp,

  IoCodeSlash, IoHeartSharp
} from 'react-icons/io5'
import { CgPlayListRemove, CgPlayButton, CgPlayPause, CgPlayTrackNext, CgPlayTrackPrev, CgHeart } from 'react-icons/cg'


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
        <CgPlayListRemove className='size-5' />
      </CtrlBtn>

      <CtrlBtn aria-label="Previous" onClick={onPrevStation}>
        <CgPlayTrackPrev className='size-5' />
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
          <CgPlayPause className='size-8' />
        ) : (
          <CgPlayButton className='size-8' />
        )}
      </button>

      <CtrlBtn aria-label="Next" onClick={onNextStation}>
        <CgPlayTrackNext className='size-5' />
      </CtrlBtn>

      <CtrlBtn aria-label="Favorite" onClick={() => { }}>
        <CgHeart className='size-5' />
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
