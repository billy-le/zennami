import { DEFAULT_PLAYER_STATE } from "@/state/player";
import { sendMessage } from "./messaging";

const audioMap: Map<string, HTMLAudioElement> = new Map();

const sendIsBuffering = (buffering: boolean) => () => {
  browser.runtime.sendMessage({ type: "SET_IS_BUFFERING", buffering });
};
export async function audioPlay({
  source,
  url,
}: {
  source: "main";
  url: string | undefined;
}) {
  if (!url) return;

  let audio = audioMap.get(source);

  if (!audio) {
    audio = new Audio();
    audio.addEventListener("waiting", sendIsBuffering(true));
    audio.addEventListener("canplay", sendIsBuffering(false));
    audio.addEventListener("playing", sendIsBuffering(false));
    audio.volume = DEFAULT_PLAYER_STATE.volume;
    audioMap.set(source, audio);
  }

  if (url === audio.src) {
    try {
      await audio.play();
    } catch (err) {
      sendMessage("log", err);
    }
    return;
  }

  audio.pause();
  audio.src = url;
  audio.load();

  try {
    await audio.play();
    sendMessage("log", "[audio] playing audio");
  } catch (err) {
    sendMessage("log", err);
  }
}

export function audioPause() {
  for (const [, audio] of audioMap) {
    audio.pause();
  }
}

export function audioSetVolume({
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

export function audioToggleMute() {
  for (const [, audio] of audioMap) {
    audio.muted = !audio.muted;
  }
}

export function isAudioPlaying() {
  for (const [, audio] of audioMap) {
    const isPlaying = !audio.paused && !audio.ended && audio.currentTime > 0;
    if (isPlaying) return true;
  }
  return false;
}
