import { apiClient } from "@/lib/api-client";
import { play, pause, setVolume, toggleMute } from "@/lib/audio";
import { isFirefox, setupOffscreenDocument } from "@/lib/helpers";
import { onMessage } from "@/lib/messaging";

import {
  DEFAULT_PLAYER_STATE,
  getAggregatedStations,
  type PlayerState,
  type StationGroup,
} from "@zennami/shared";

const CACHE_TTL = 1000 * 60 * 60; // 1 hour

const memCache = new Map<string, { data: StationGroup[]; ts: number }>();

let playerState: PlayerState = {
  isPlaying: false,
  currentStation: null,
  volume: 1,
};

async function savePlayerState() {
  await browser.storage.local.set({ playerState });
}

async function loadPlayerState(): Promise<PlayerState> {
  const stored = await browser.storage.local.get<{ playerState: PlayerState }>(
    "playerState",
  );
  return stored.playerState ?? DEFAULT_PLAYER_STATE;
}

async function getGroupStations(): Promise<StationGroup[]> {
  const cacheKey = `group-stations`;
  const mem = memCache.get(cacheKey);
  if (mem && Date.now() - mem.ts < CACHE_TTL) return mem.data;

  const stored =
    await browser.storage.local.get<
      Record<string, { data: StationGroup[]; ts: number }>
    >(cacheKey);
  const entry = stored[cacheKey];

  if (entry && Date.now() - entry.ts < CACHE_TTL) {
    console.log("[background] cache hit");
    memCache.set(cacheKey, entry); // repopulate memory
    return entry.data;
  }

  const data = await getAggregatedStations(); // network request happens here

  const payload = { data, ts: Date.now() };
  memCache.set(cacheKey, payload);
  await browser.storage.local.set({ [cacheKey]: payload });
  return data;
}

export default defineBackground(() => {
  let isOffscreenReady = false;

  loadPlayerState().then(async (state) => {
    playerState = {
      ...state,
      isPlaying: false,
    };

    if (!isFirefox) {
      console.log("[background] creating offscreen document");
      await setupOffscreenDocument("./offscreen.html").then(() => {
        console.log("[offscreen] offscreen ready");
        isOffscreenReady = true;
      });
    }
  });

  async function playStation(stationUrl: string) {
    if (isFirefox) {
      await play({ source: "main", url: stationUrl });
      playerState = {
        ...playerState,
        isPlaying: true,
      };
      await savePlayerState();
      return;
    }
    if (!isOffscreenReady) return;
    await browser.runtime.sendMessage({
      type: "OFFSCREEN_PLAY",
      url: stationUrl,
    });
  }

  async function switchStation(
    direction: "next" | "prev",
  ): Promise<PlayerState> {
    const currentStation = playerState.currentStation;
    if (!currentStation) return playerState;

    const groups = await getGroupStations();
    if (!groups.length) return playerState;
    let stationIdx: number = 0;
    const groupIndex = groups.findIndex((s) =>
      s.variants.some((v, i) => {
        if (v.station.stationuuid === currentStation.stationuuid) {
          stationIdx = i;
          return true;
        }
        return false;
      }),
    );

    const group = groups[groupIndex]!;
    let stationVariant =
      direction === "next"
        ? group.variants[stationIdx + 1]
        : group.variants[stationIdx - 1];
    if (!stationVariant) {
      const groupStationIndex =
        direction === "next"
          ? (groupIndex + 1) % groups.length
          : (groupIndex - 1 + groups.length) % groups.length;
      const groupStation = groups[groupStationIndex];
      stationVariant =
        direction === "next"
          ? groupStation.variants.at(0)!
          : groupStation.variants.at(-1)!;
    }

    playerState = {
      ...playerState,
      currentStation: stationVariant.station,
    };

    await savePlayerState();
    if (playerState.isPlaying) {
      await playStation(stationVariant.station.url_resolved);
    }

    return playerState;
  }

  // Pre-fetch on install
  browser.runtime.onInstalled.addListener(async () => {
    console.log("[background] pre-warming station cache...");
    await getGroupStations().catch(console.error);
  });

  // Pre-fetch on browser startup
  browser.runtime.onStartup.addListener(async () => {
    console.log("[background] pre-fetching station cache...");
    await getGroupStations().catch(console.error);
  });

  onMessage("getGroupStations", async () => {
    return await getGroupStations();
  });

  onMessage("getNowPlaying", async ({ data }) => {
    const res = await apiClient.api["now-playing"].$get({
      query: { url: data.streamUrl },
    });

    const json = await res.json();

    if (!json.success) {
      throw new Error(json.error);
    }

    return json;
  });

  onMessage("getPlayerState", async () => {
    if (playerState.currentStation) return playerState;

    const groupStations = await getGroupStations();
    const firstStation = groupStations?.[0]?.variants?.[0]?.station ?? null;

    playerState = {
      ...playerState,
      currentStation: firstStation,
    };

    await savePlayerState();
    return playerState;
  });

  onMessage("playStation", async ({ data }) => {
    playerState = {
      ...playerState,
      isPlaying: true,
      currentStation: data.station,
    };

    await savePlayerState();
    return await playStation(data.station.url_resolved);
  });

  onMessage("pauseStation", async () => {
    playerState = {
      ...playerState,
      isPlaying: false,
    };
    await savePlayerState();
    if (isFirefox) {
      return pause();
    }
    if (!isOffscreenReady) return;
    return await browser.runtime.sendMessage({
      type: "OFFSCREEN_PAUSE",
    });
  });

  onMessage("setVolume", async ({ data }) => {
    playerState = {
      ...playerState,
      volume: data.volume,
    };
    await savePlayerState();
    if (isFirefox) {
      return setVolume({ source: "main", volume: data.volume });
    }
    if (!isOffscreenReady) return;
    return await browser.runtime.sendMessage({
      type: "OFFSCREEN_VOLUME",
      volume: data.volume,
    });
  });

  onMessage("nextStation", async () => switchStation("next"));
  onMessage("prevStation", async () => switchStation("prev"));
  onMessage("toggleMute", async () => {
    if (isFirefox) {
      return toggleMute();
    }
    if (!isOffscreenReady) return;
    return await browser.runtime.sendMessage({
      type: "OFFSCREEN_TOGGLE_MUTE",
    });
  });

  onMessage("log", async ({ data }) => {
    console.log(data);
    return;
  });
});
