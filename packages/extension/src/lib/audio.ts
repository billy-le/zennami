const audioMap: Map<string, HTMLAudioElement> = new Map();

export function play({ source, url }: { source: "main"; url: string }) {
  const exisiting = audioMap.get(source);
  if (exisiting) {
    exisiting.pause();
    exisiting.src = "";
    exisiting.removeAttribute("src");
    exisiting.load();
    audioMap.delete(source);
  }

  const audio = new Audio(url);

  audio.play().catch(console.error);
  audioMap.set(source, audio);
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
