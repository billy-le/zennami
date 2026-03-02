console.log("[offscreen] loaded");
import { play, pause, setVolume } from "@/lib/audio";

function audioStoppped() {
  browser.runtime.sendMessage({ type: "AUDIO_STOPPED" });
}

browser.runtime.onMessage.addListener((message) => {
  switch (message.type) {
    case "OFFSCREEN_PLAY":
      play({ source: "main", url: message.url });
      break;
    case "OFFSCREEN_PAUSE":
      pause();
      break;
    case "OFFSCREEN_VOLUME":
      setVolume({ source: "main", volume: message.volume });
      break;
  }

  return true;
});
