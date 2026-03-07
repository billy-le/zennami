import { IoVolumeHighSharp } from "react-icons/io5";
import { cx } from "@zennami/shared"
import { usePlayerState } from '@/state/player'
import './volume-bar.css'

export function VolumeBar({ className }: { className?: string }) {
  const volume = usePlayerState(state => state.volume)
  const setVolume = usePlayerState(state => state.setVolume)
  const muteVolume = usePlayerState(state => state.muteVolume)

  function onAdjustVolume(e: React.ChangeEvent<HTMLInputElement>) {
    const { value } = e.target
    const val = parseFloat(value)
    setVolume(val)
  }

  return <div className={cx("flex w-full items-center gap-2", className)}>
    <button onClick={muteVolume}>
      <IoVolumeHighSharp className="text-fog" />
    </button>
    <input type='range' min={0} max={1} step={0.01} defaultValue={volume} onChange={onAdjustVolume}
      style={{
        ['--volume-fill' as string]: `${volume * 100}%`
      }}
    />
  </div>

}
