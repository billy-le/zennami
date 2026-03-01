import type { PublicPath } from "wxt/browser";

export const isFirefox = navigator.userAgent.includes("Firefox");

let creating: Promise<void> | null;

export async function setupOffscreenDocument(path: PublicPath) {
  const offscreenUrl = browser.runtime.getURL(path);
  const existingContexts = await browser.runtime.getContexts({
    contextTypes: ["OFFSCREEN_DOCUMENT"],
    documentUrls: [offscreenUrl],
  });

  if (existingContexts.length > 0) {
    return;
  }

  if (creating) {
    await creating;
  } else {
    creating = browser.offscreen.createDocument({
      url: path,
      reasons: ["AUDIO_PLAYBACK"],
      justification: "Radio station audio",
    });
    await creating;
    creating = null;
  }
}
