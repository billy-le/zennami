import { defineExtensionMessaging } from "@webext-core/messaging";
import type { PlayerState, RadioStation } from "@zennami/shared";
import type { InferResponseType } from "hono/client";
import type { ApiClient } from "./api-client";

type NowPlayingOk = InferResponseType<
  ApiClient["api"]["now-playing"]["$get"],
  200
>;
type NowPlayingError = InferResponseType<
  ApiClient["api"]["now-playing"]["$get"],
  500
>;
type NowPlayingBadRequest = InferResponseType<
  ApiClient["api"]["now-playing"]["$get"],
  400
>;

interface ProtocolMap {
  getStations(): RadioStation[];
  getNowPlaying(params: {
    streamUrl: string;
  }): NowPlayingOk | NowPlayingError | NowPlayingBadRequest;
  getPlayerState(): PlayerState;
  playStation(params: { station: RadioStation }): void;
  pauseStation(): void;
  setVolume(params: { volume: number }): void;
}

export const { sendMessage, onMessage } =
  defineExtensionMessaging<ProtocolMap>();
