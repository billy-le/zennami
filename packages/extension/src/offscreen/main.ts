import {
  audioPlay,
  audioPause,
  audioSetVolume,
  audioToggleMute,
  isAudioPlaying,
} from "@/lib/audio";

browser.runtime.sendMessage({
  type: "OFFSCREEN_READY",
});

browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  switch (message.type) {
    case "OFFSCREEN_PLAY": {
      audioPlay({ source: "main", url: message.url })
        .then(() => sendResponse({ success: true }))
        .catch(() => sendResponse({ success: false }));
      return true;
    }
    case "OFFSCREEN_PAUSE": {
      audioPause();
      sendResponse({ success: true });
      return false;
    }
    case "OFFSCREEN_SET_VOLUME": {
      audioSetVolume({ source: "main", volume: message.volume });
      sendResponse({ success: true });
      return false;
    }
    case "OFFSCREEN_TOGGLE_MUTE": {
      audioToggleMute();
      sendResponse({ success: true });
      return false;
    }
    case "OFFSCREEN_IS_AUDIO_PLAYING": {
      const isPlaying = isAudioPlaying();
      sendResponse({ success: true, isPlaying });
      return false;
    }
  }
});
