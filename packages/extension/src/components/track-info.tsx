import { usePlayerState } from "@/state/player"
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export function TrackInfo() {
  const stationName = usePlayerState(state => state.currentStation?.name);
  const stationUrl = usePlayerState(state => state.currentStation?.url_resolved)
  const isBuffering = usePlayerState(state => state.isBuffering)
  const { data: nowPlaying, isPending } = useQuery({
    queryKey: ['now-playing', stationUrl],
    queryFn: async () => {
      const res = await apiClient.api["now-playing"].$get({ query: { url: stationUrl! } })
      if (res.ok) {
        const json = await res.json();
        if (json.success) {
          return json.data
        }
      }

      return null;
    },
    enabled: stationUrl != undefined
  })

  return <div className="text-center mb-5 w-full">
    <div className="text-2xl font-light italic text-cream tracking-wide mb-1 whitespace-nowrap overflow-hidden text-ellipsis">
      {stationName}
    </div>
    <div
      className="font-mono font-light text-sm text-fog tracking-widest uppercase line-clamp-1"
    >
      {isBuffering ? 'Buffering...' : isPending ? "Loading Song Title" : nowPlaying && nowPlaying.title ? nowPlaying.title : 'No Song Title'}
    </div>
  </div>

}
