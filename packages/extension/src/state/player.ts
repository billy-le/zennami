import { sendMessage } from "@/lib/messaging";
import { RadioStation } from "@zennami/shared";
import { create } from "zustand";
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from "zustand/middleware";

export interface PlayerState {
  isPlaying: boolean;
  isBuffering: boolean;
  currentStation: RadioStation | null;
  volume: number;
  favoriteStations: string[];
  hiddenStations: string[];
}

interface PlayerActions {
  init(): void;
  setRadioStation(radioStation: RadioStation): void;
  setVolume(volume: number): void;
  muteVolume(): void;
  setIsPlaying(isPlaying: boolean): void;
  setIsBuffering(isBuffering: boolean): void;
  switchRadioStation(direction: "next" | "prev"): void;
  hideRadioStation(radioStationId: RadioStation["stationuuid"]): void;
  unhideRadioStation(radioStationId: RadioStation["stationuuid"]): void;
  favoriteRadioStation(radioStationId: RadioStation["stationuuid"]): void;
  unfavoriteRadioStation(radioStationId: RadioStation["stationuuid"]): void;
}

export const STORAGE_KEY = "zennami-storage";

export const DEFAULT_PLAYER_STATE: PlayerState = {
  isPlaying: false,
  isBuffering: false,
  currentStation: null,
  volume: 0.5,
  favoriteStations: [],
  hiddenStations: [],
};

const browserStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const value = await browser.storage.local.get(name);
    const data = value[name];
    return data ? JSON.stringify(data) : null;
  },
  setItem: async (name: string, value: string): Promise<void> => {
    await browser.storage.local.set({ [name]: JSON.parse(value) });
  },
  removeItem: async (name: string): Promise<void> => {
    await browser.storage.local.remove(name);
  },
};

export const usePlayerState = create<PlayerState & PlayerActions>()(
  persist(
    (set, get) => ({
      ...DEFAULT_PLAYER_STATE,
      init: async () => {
        try {
          const state = get();
          if (!state.currentStation) {
            const groupStations = await sendMessage("getGroupStations");
            if (groupStations?.length > 0) {
              set(() => ({
                currentStation: groupStations[0]!.variants[0]!.station,
              }));
            }
          }
          const isPlaying = await sendMessage("getIsAudioPlaying");
          set(() => ({ isPlaying, isBuffering: false }));
        } catch (err) {
          console.error("Error initializing", err);
        }
      },
      setRadioStation: async (station) => {
        const state = get();

        set(() => ({ currentStation: station }));
        if (!state.isPlaying) return;

        try {
          await sendMessage("playRadioStation");
        } catch (err) {
          console.error(err);
        }
      },
      switchRadioStation: async (direction) => {
        let state = get();
        const currentStation = state.currentStation;
        if (!currentStation) return;

        const groups = await sendMessage("getGroupStations");

        if (!groups.length) return;

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

        set(() => ({
          currentStation: stationVariant.station,
        }));

        try {
          if (state.isPlaying) {
            await sendMessage("playRadioStation");
          }
        } catch (err) {
          console.log("error", err);
        }
      },
      setVolume: async (volume) => {
        const prevVolume = get().volume;
        set(() => ({
          volume,
        }));
        try {
          await sendMessage("setVolume");
        } catch (err) {
          console.error(err);
          set(() => ({ volume: prevVolume }));
        }
      },
      muteVolume: async () => {
        try {
          await sendMessage("toggleMute");
        } catch (err) {
          console.log("error", err);
        }
      },
      setIsPlaying: async (isPlaying) => {
        set(() => ({
          isPlaying,
        }));
        try {
          await sendMessage("togglePlayPause");
        } catch (err) {
          console.error(err);
          set(() => ({ isPlaying: !isPlaying }));
        }
      },
      setIsBuffering: (isBuffering) => set(() => ({ isBuffering })),
      hideRadioStation: (radioStationId) =>
        set((state) => ({
          hiddenStations: state.hiddenStations.concat(radioStationId),
        })),
      unhideRadioStation: (radioStationId) =>
        set((state) => ({
          hiddenStations: state.hiddenStations.filter(
            (id) => id !== radioStationId,
          ),
        })),
      favoriteRadioStation: (radioStationId) =>
        set((state) => ({
          favoriteStations: state.favoriteStations.concat(radioStationId),
        })),
      unfavoriteRadioStation: (radioStationId) =>
        set((state) => ({
          favoriteStations: state.favoriteStations.filter(
            (id) => id !== radioStationId,
          ),
        })),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => browserStorage),
    },
  ),
);
