import { useGroupStations } from "@/hooks/use-stations"
import { useNowPlaying } from "@/hooks/use-now-playing"
import { ZenPlayer } from "@zennami/shared"
import { usePlayerState, useControls } from "@/hooks/use-player-state"

export function ApiWrapper() {
  const { data: playerState, } = usePlayerState()
  const { toggle, isPlaying, next, prev, volume, setVolume, } = useControls()
  const { data: groupStations = [] } = useGroupStations()
  const { data } = useNowPlaying(playerState.currentStation?.url_resolved)


  function onFavorite() { }

  return <ZenPlayer groupStations={groupStations} currentStation={playerState?.currentStation} nowPlaying={data?.success ? {
    ...data.data,
  } : undefined} isPlaying={isPlaying} onFavorite={onFavorite} onNextStation={next} onPrevStation={prev} onTogglePlay={toggle} volume={volume} />
}
