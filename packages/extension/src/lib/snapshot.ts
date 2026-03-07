import { PlayerState } from "@/state/player";

const SNAPSHOT_KEY = "player-state-snapshot";

export function readSnapshot(): PlayerState | undefined {
  try {
    const snap = sessionStorage.getItem(SNAPSHOT_KEY);
    return snap ? JSON.parse(snap) : undefined;
  } catch {
    return undefined;
  }
}

export function writeSnapshot(state: PlayerState) {
  try {
    sessionStorage.setItem(SNAPSHOT_KEY, JSON.stringify(state));
  } catch {}
}
