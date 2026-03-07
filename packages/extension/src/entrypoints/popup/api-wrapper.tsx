import { Activity } from 'react';
import { Button } from "@zennami/shared"
import { TrackInfo } from '@/components/track-info';
import { Controls } from '@/components/controls';
import { VolumeBar } from '@/components/volume-bar';
import { PlaylistPanel } from '@/components/playlist-panel';
import { usePlayerState } from '@/state/player'
import { useState, useSyncExternalStore } from 'react';

export function ApiWrapper() {
  const [showPlaylist, setShowPlaylist] = useState(false);

  const hasHydrated = useSyncExternalStore(
    usePlayerState.persist.onFinishHydration,
    usePlayerState.persist.hasHydrated
  );

  if (!hasHydrated) {
    return <div>Loading....</div>
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
      <TrackInfo />

      <Controls />

      <div className="flex items-center justify-between gap-3">
        <VolumeBar className="flex-1" />
        <Button onClick={() => { setShowPlaylist(true) }}>
          Stations
        </Button>
      </div>
    </div>

    <Activity>
      <PlaylistPanel
        open={showPlaylist}
        onClose={() => setShowPlaylist(false)}
      />
    </Activity>

  </main>
}
