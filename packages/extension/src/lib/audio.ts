import { DEFAULT_PLAYER_STATE } from "@zennami/shared";
import { sendMessage } from "./messaging";

const audioMap: Map<string, HTMLAudioElement> = new Map();

export async function play({ source, url }: { source: "main"; url: string }) {
  const exisiting = audioMap.get(source);
  let internalVolume = exisiting?.volume ?? DEFAULT_PLAYER_STATE.volume;

  if (exisiting) {
    exisiting.pause();
    exisiting.src = "";
    exisiting.removeAttribute("src");
    exisiting.load();
    audioMap.delete(source);
  }

  const audio = new Audio(url);

  audio.volume = internalVolume;
  audio.load();
  try {
    sendMessage("log", "[audio] playing audio");
    await audio.play();
    audioMap.set(source, audio);
  } catch (err) {
    sendMessage("log", err);
  }
}

export function pause() {
  for (const [, audio] of audioMap) {
    audio.pause();
  }
}

export function setVolume({
  source,
  volume,
}: {
  source: "main";
  volume: number;
}) {
  const audio = audioMap.get(source);
  if (audio) {
    audio.volume = volume;
  }
}

export function toggleMute() {
  for (const [, audio] of audioMap) {
    audio.muted = !audio.muted;
  }
}
