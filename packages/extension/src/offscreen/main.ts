console.log("[offscreen] loaded");
import { play, pause, setVolume, toggleMute } from "@/lib/audio";

browser.runtime.onMessage.addListener((message) => {
  switch (message.type) {
    case "OFFSCREEN_PLAY": {
      play({ source: "main", url: message.url });
      return true;
    }
    case "OFFSCREEN_PAUSE": {
      pause();
      return true;
    }
    case "OFFSCREEN_VOLUME": {
      setVolume({ source: "main", volume: message.volume });
      return true;
    }
    case "OFFSCREEN_TOGGLE_MUTE": {
      toggleMute();
      return true;
    }
  }
});
