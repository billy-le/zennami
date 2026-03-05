import { IoVolumeHighSharp } from "react-icons/io5";
import './volume-bar.css'
import { cx } from "../lib/cva";

export function VolumeBar({ volume, onAdjustVolume, toggleMute, className }: { volume: number, onAdjustVolume: React.ChangeEventHandler<HTMLInputElement>; toggleMute: () => void; className?: string }) {
  return <div className={cx("flex w-full items-center gap-2", className)}>
    <button onClick={toggleMute}>
      <IoVolumeHighSharp className="text-fog" />
    </button>
    <input type='range' min={0} max={1} step={0.01} defaultValue={volume} onChange={onAdjustVolume}
      style={{
        ['--volume-fill' as string]: `${volume * 100}%`
      }}
    />
  </div>

}
