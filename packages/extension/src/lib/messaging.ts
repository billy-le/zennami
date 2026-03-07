import { defineExtensionMessaging } from "@webext-core/messaging";
import type { StationGroup } from "@zennami/shared";

interface ProtocolMap {
  getGroupStations(): StationGroup[];
  playRadioStation(): void;
  togglePlayPause(): void;
  toggleMute(): void;
  setVolume(): void;
  getIsAudioPlaying(): boolean;
  log(msg: any): void;
  setIsBuffering(isBuffering: boolean): void;
}

export const { sendMessage, onMessage } =
  defineExtensionMessaging<ProtocolMap>();
