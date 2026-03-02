import { RadioStation } from "./radio-station";

export interface PlayerState {
  isPlaying: boolean;
  currentStation: RadioStation | null;
  volume: number;
}
