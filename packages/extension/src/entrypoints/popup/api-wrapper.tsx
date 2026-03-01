import { useStations } from "@/hooks/use-stations"
import { useNowPlaying } from "@/hooks/use-now-playing"
import { ZenPlayer } from "@zennami/shared"
import { usePlayerState, useControls } from "@/hooks/use-player-state"

export function ApiWrapper() {
  const { data: playerState, } = usePlayerState()
  const { toggle, isPlaying } = useControls()
  const { data: stations = [] } = useStations('lofi')
  const { data } = useNowPlaying(stations?.[0]?.url_resolved)

  function onFavorite() { }

  function onNextStation() {
    onNextStation()
  }

  function onPrevStation() { }

  return <ZenPlayer stations={stations} currentStation={playerState?.currentStation} nowPlaying={data?.success ? {
    ...data.data,
  } : undefined} isPlaying={isPlaying} onFavorite={onFavorite} onNextStation={onNextStation} onPrevStation={onPrevStation} onTogglePlay={toggle} />
}
