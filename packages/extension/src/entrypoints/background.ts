import {
  audioPlay,
  audioPause,
  audioSetVolume,
  audioToggleMute,
  isAudioPlaying,
} from "@/lib/audio";
import {
  hasOffscreenDocument,
  isFirefox,
  setupOffscreenDocument,
} from "@/lib/helpers";
import { onMessage, sendMessage } from "@/lib/messaging";
import { STORAGE_KEY, usePlayerState } from "@/state/player";
import { getAggregatedStations, type StationGroup } from "@zennami/shared";

const CACHE_TTL = 1000 * 60 * 60; // 1 hour

const memCache = new Map<string, { data: StationGroup[]; ts: number }>();

export default defineBackground({
  type: "module",
  main: async () => {
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

    browser.storage.onChanged.addListener(async (changes, area) => {
      if (area === "local" && changes[STORAGE_KEY]) {
        await usePlayerState.persist.rehydrate();
      }
    });

    browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      switch (message.type) {
        case "SET_IS_BUFFERING": {
          sendMessage("setIsBuffering", message.buffering);
          sendResponse({ success: true });
          return false;
        }
      }
    });

    async function getPlayerState() {
      await usePlayerState.persist.rehydrate();
      return usePlayerState.getState();
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

    const waitForOffscreen = new Promise<void>((resolve) => {
      const listener = (msg: { type: "OFFSCREEN_READY" }) => {
        if (msg.type === "OFFSCREEN_READY") {
          console.log("[background] Handshake received!");
          browser.runtime.onMessage.removeListener(listener);
          resolve();
        }
      };
      browser.runtime.onMessage.addListener(listener);
    });

    async function loadOffscreenDocument() {
      await setupOffscreenDocument("./offscreen.html");
      await waitForOffscreen;
    }

    onMessage("getIsAudioPlaying", async () => {
      if (isFirefox) {
        return isAudioPlaying();
      }
      if (!(await hasOffscreenDocument())) {
        await loadOffscreenDocument();
      }
      const { isPlaying } = await browser.runtime.sendMessage({
        type: "OFFSCREEN_IS_AUDIO_PLAYING",
      });
      return isPlaying;
    });

    onMessage("getGroupStations", async () => {
      return await getGroupStations();
    });

    onMessage("playRadioStation", async () => {
      const state = await getPlayerState();
      if (!state.currentStation) return;
      if (isFirefox) {
        await audioPlay({
          source: "main",
          url: state.currentStation.url_resolved,
        });
        return;
      }
      if (!(await hasOffscreenDocument())) {
        await loadOffscreenDocument();
      }
      await browser.runtime.sendMessage({
        type: "OFFSCREEN_PLAY",
        url: state.currentStation.url_resolved,
      });
    });

    onMessage("togglePlayPause", async () => {
      const state = await getPlayerState();

      if (isFirefox) {
        state.isPlaying
          ? await audioPlay({
              source: "main",
              url: state.currentStation?.url_resolved,
            })
          : audioPause();
        return;
      }

      if (!(await hasOffscreenDocument())) {
        await loadOffscreenDocument();
      }

      await browser.runtime.sendMessage({
        type: state.isPlaying ? "OFFSCREEN_PLAY" : "OFFSCREEN_PAUSE",
        url: state.currentStation?.url_resolved,
      });
    });

    onMessage("setVolume", async () => {
      const state = await getPlayerState();

      if (isFirefox) {
        audioSetVolume({ source: "main", volume: state.volume });
        return;
      }

      if (!(await hasOffscreenDocument())) {
        await loadOffscreenDocument();
      }
      await browser.runtime.sendMessage({
        type: "OFFSCREEN_SET_VOLUME",
        volume: state.volume,
      });
    });

    onMessage("toggleMute", async () => {
      if (isFirefox) {
        audioToggleMute();
        return;
      }
      if (!(await hasOffscreenDocument())) {
        await loadOffscreenDocument();
      }
      await browser.runtime.sendMessage({
        type: "OFFSCREEN_TOGGLE_MUTE",
      });
    });

    onMessage("log", async ({ data }) => {
      console.log(data);
      return;
    });
  },
});
