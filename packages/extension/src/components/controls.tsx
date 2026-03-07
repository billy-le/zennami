import { CgPlayListRemove, CgPlayButton, CgPlayPause, CgPlayTrackNext, CgPlayTrackPrev, CgHeart } from 'react-icons/cg'
import { usePlayerState } from '@/state/player';
import { cx } from '@zennami/shared';

export function Controls() {
  const switchStations = usePlayerState(state => state.switchRadioStation)
  const isBuffering = usePlayerState(state => state.isBuffering)
  const hideStation = usePlayerState(state => state.hideRadioStation)
  const favoriteStation = usePlayerState(state => state.favoriteRadioStation)
  const currentStation = usePlayerState(state => state.currentStation)
  return (
    <div className="flex items-center justify-center gap-7 mb-6">
      <CtrlBtn aria-label="Hide Station" onClick={() => {
        if (isBuffering) return;
        if (currentStation) {
          hideStation(currentStation.stationuuid)
          switchStations('next')
        }
      }}
        disabled={isBuffering}
      >
        <CgPlayListRemove className='size-5' />
      </CtrlBtn>

      <CtrlBtn aria-label="Previous" onClick={() => {
        if (isBuffering) return;
        switchStations('prev')
      }}
        disabled={isBuffering}
      >
        <CgPlayTrackPrev className='size-5' />
      </CtrlBtn>

      <PlayPauseButton />

      <CtrlBtn aria-label="Next" onClick={() => {
        if (isBuffering) return;
        switchStations('next')
      }}
        disabled={isBuffering}
      >
        <CgPlayTrackNext className='size-5' />
      </CtrlBtn>

      <CtrlBtn aria-label="Favorite" onClick={() => {
        if (isBuffering) return;
        if (currentStation) {
          favoriteStation(currentStation.stationuuid)
        }
      }}
        disabled={isBuffering}
      >
        <CgHeart className='size-5' />
      </CtrlBtn>
    </div>
  );
}

function PlayPauseButton() {
  const isPlaying = usePlayerState(state => state.isPlaying);
  const setIsPlaying = usePlayerState(state => state.setIsPlaying)
  const isBuffering = usePlayerState(state => state.isBuffering)

  return <button
    aria-label={isPlaying ? "Pause" : "Play"}
    onClick={() => {
      if (isBuffering) return;
      setIsPlaying(!isPlaying)
    }}
    className={cx("size-13 rounded-full flex items-center justify-center text-cream border border-amber/30", "cursor-pointer transition-all duration-300 hover:border-amber/50 hover:scale-105",
      "disabled:opacity-25 disabled:cursor-not-allowed disabled:pointer-none disabled:hover:scale-100"
    )}
    style={{
      background: "linear-gradient(135deg, rgba(74,103,65,0.6), rgba(45,59,46,0.8))",
      boxShadow: "0 0 20px rgba(74,103,65,0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
    }}
    disabled={isBuffering}
  >
    {isPlaying ? (
      <CgPlayPause className='size-8' />
    ) : (
      <CgPlayButton className='size-8' />
    )}
  </button>
}

function CtrlBtn({ children, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      {...props}
      className={cx("bg-transparent border-none cursor-pointer text-mist opacity-60",
        "flex items-center justify-center p-1 transition-all duration-200 hover:opacity-100 hover:scale-110",
        "disabled:opacity-25 disabled:cursor-not-allowed disabled:pointer-events-none disabled:hover:scale-100"
      )}
    >
      {children}
    </button>
  );
}
