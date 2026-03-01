import type { PlayerState } from "@zennami/shared";

declare global {
  interface Window {
    __PLAYER_STATE__?: PlayerState;
  }
}
