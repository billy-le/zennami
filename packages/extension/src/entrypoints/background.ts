import { apiClient } from "@/lib/api-client";
import { isFirefox, setupOffscreenDocument } from "@/lib/helpers";
import { onMessage, sendMessage } from "@/lib/messaging";
import {
  DEFAULT_PLAYER_STATE,
  getStationsByTag,
  type RadioStation,
  type PlayerState,
} from "@zennami/shared";

const CACHE_TTL = 1000 * 60 * 60; // 1 hour

const memCache = new Map<string, { data: RadioStation[]; ts: number }>();

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

async function getStations(tag: string): Promise<RadioStation[]> {
  const mem = memCache.get(tag);
  if (mem && Date.now() - mem.ts < CACHE_TTL) return mem.data;

  const stored = await browser.storage.local.get<
    Record<string, { data: RadioStation[]; ts: number }>
  >(`stations:${tag}`);
  const entry = stored[`stations:${tag}`];

  if (entry && Date.now() - entry.ts < CACHE_TTL) {
    console.log("[background] cache hit");
    memCache.set(tag, entry); // repopulate memory
    return entry.data;
  }

  const data = await getStationsByTag(tag); // network request happens here

  const payload = { data, ts: Date.now() };
  memCache.set(tag, payload);
  await browser.storage.local.set({ [`stations:${tag}`]: payload });
  return data;
}

export default defineBackground(() => {
  loadPlayerState().then((state) => {
    playerState = state;

    // Resume playback if was playing
    if (state.isPlaying && state.currentStation) {
      sendMessage("playStation", { station: state.currentStation });
    }
  });

  if (!isFirefox) {
    console.log("[background] creating offscreen document");
    setupOffscreenDocument("./offscreen.html");
  }

  // Pre-fetch on install
  browser.runtime.onInstalled.addListener(async () => {
    console.log("[background] pre-warming station cache...");
    await getStations("lofi").catch(console.error);
  });

  // Pre-fetch on browser startup
  browser.runtime.onStartup.addListener(async () => {
    await getStations("lofi").catch(console.error);
  });

  onMessage("getStations", async () => {
    return getStations("lofi");
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

    const stations = await getStations("lofi");
    const firstStation = stations[0] ?? null;

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
    const proxiedUrl = `${import.meta.env.VITE_SERVER_URL}/api/stream?url=${encodeURIComponent(data.station.url_resolved)}`;
    await browser.runtime.sendMessage({
      type: "OFFSCREEN_PLAY",
      url: proxiedUrl,
    });
  });

  onMessage("pauseStation", async () => {
    playerState = {
      ...playerState,
      isPlaying: false,
    };
    await savePlayerState();
    await browser.runtime.sendMessage({
      type: "OFFSCREEN_PAUSE",
    });
  });

  onMessage("setVolume", async ({ data }) => {
    playerState = {
      ...playerState,
      volume: data.volume,
    };
    await savePlayerState();
    await browser.runtime.sendMessage({
      type: "OFFSCREEN_VOLUME",
      volume: data.volume,
    });
  });
});
