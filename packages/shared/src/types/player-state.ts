import { RadioStation } from "./radio-station";

export interface PlayerState {
  isPlaying: boolean;
  currentStation: RadioStation | null;
  volume: number;
}

export const DEFAULT_PLAYER_STATE: PlayerState = {
  isPlaying: false,
  currentStation: null,
  volume: 1,
};
