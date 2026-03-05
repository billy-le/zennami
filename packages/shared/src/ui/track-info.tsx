export function TrackInfo({ stationName, songTitle }: { stationName?: string, songTitle?: string | null }) {
  return <div className="text-center mb-5 w-full">
    <div className="text-2xl font-light italic text-cream tracking-wide mb-1 whitespace-nowrap overflow-hidden text-ellipsis">
      {stationName}
    </div>
    <div
      className="font-mono font-light text-sm text-fog tracking-widest uppercase line-clamp-1"
    >
      {songTitle ?? "Now Playing"}
    </div>
  </div>

}
