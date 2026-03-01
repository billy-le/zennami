import { useStations } from "@/hooks/use-stations"
import { useNowPlaying } from "@/hooks/use-now-playing"
import { ZenPlayer } from "@zennami/shared"
import { usePlayerState, useControls } from "@/hooks/use-player-state"

export function ApiWrapper() {
  const { data: playerState, } = usePlayerState()
  const { toggle, isPlaying, next, prev } = useControls()
  const { data: stations = [] } = useStations('lofi')
  const { data } = useNowPlaying(playerState.currentStation?.url_resolved)

  function onFavorite() { }

  return <ZenPlayer stations={stations} currentStation={playerState?.currentStation} nowPlaying={data?.success ? {
    ...data.data,
  } : undefined} isPlaying={isPlaying} onFavorite={onFavorite} onNextStation={next} onPrevStation={prev} onTogglePlay={toggle} />
}
