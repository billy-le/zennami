console.log("[offscreen] loaded");

const audio = document.getElementById("player") as HTMLAudioElement;

browser.runtime.onMessage.addListener((message) => {
  console.log("[offscreen] received message:", message);

  switch (message.type) {
    case "OFFSCREEN_PLAY":
      audio.src = message.url;
      audio.load();
      audio.addEventListener("canplay", () => {
        audio.play();
      });
      break;
    case "OFFSCREEN_PAUSE":
      audio.pause();
      break;
    case "OFFSCREEN_VOLUME":
      audio.volume = message.volume;
      break;
  }
});
