import { Activity } from 'react';
import { useGroupStations } from "@/hooks/use-stations"
import { useNowPlaying } from "@/hooks/use-now-playing"
import { TrackInfo, Controls, VolumeBar, Button, PlaylistPanel } from "@zennami/shared"
import { usePlayerState, useControls } from "@/hooks/use-player-state"

export function ApiWrapper() {
  const { data: playerState, } = usePlayerState()
  const { toggle, isPlaying, next, prev, volume, setVolume, toggleMute, play, } = useControls()
  const { data: groupStations = [] } = useGroupStations()
  const { data: nowPlaying } = useNowPlaying(playerState?.currentStation?.url_resolved)


  const [showPlaylist, setShowPlaylist] = useState(false);
  const activeTrackId = useMemo(() => playerState?.currentStation?.stationuuid, [playerState?.currentStation])

  function onAdjustVolume(e: React.ChangeEvent<HTMLInputElement>) {
    const { value } = e.target
    const val = parseFloat(value)
    setVolume(val)
  }

  return <main className='py-6 px-10 font-display'>
    <div className="w-full flex justify-between items-center mb-6">
      <h1
        className="text-xs font-mono tracking-[0.35em] uppercase text-fog"
      >
        ZenNami
      </h1>
    </div>
    <div className='w-full'>
      <TrackInfo songTitle={nowPlaying?.success ? nowPlaying?.data?.title : undefined} stationName={playerState?.currentStation?.name} />

      <Controls playing={isPlaying} onTogglePlay={toggle} onPrevStation={prev} onNextStation={next} />

      <div className="flex items-center justify-between gap-3">
        <VolumeBar volume={volume ?? 0.5} onAdjustVolume={onAdjustVolume} toggleMute={toggleMute} className="flex-1" />
        <Button onClick={() => { setShowPlaylist(true) }}>
          Stations
        </Button>
      </div>
    </div>

    <Activity>
      <PlaylistPanel
        isPlaying={isPlaying}
        groupStations={groupStations}
        open={showPlaylist}
        onClose={() => setShowPlaylist(false)}
        activeTrackId={activeTrackId}
        onSelectStation={(station) => {
          play(station)
          setShowPlaylist(false);
        }}
      />
    </Activity>

  </main>
}
