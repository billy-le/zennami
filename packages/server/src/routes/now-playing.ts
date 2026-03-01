import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { USER_AGENT } from "@zennami/shared";
import { z } from "zod";

const nowPlayingSchema = z.object({
  url: z.string().url("must be a valid URL"),
});

const app = new Hono().get(
  "/",
  zValidator("query", nowPlayingSchema),
  async (c) => {
    const streamUrl = c.req.query("url");
    if (!streamUrl)
      return c.json({ success: false, error: "url required" }, 400);

    try {
      const res = await fetch(streamUrl, {
        headers: {
          "Icy-MetaData": "1", // ask the stream to include metadata
          Range: "bytes=0-",
          "User-Agent": USER_AGENT,
        },
        signal: AbortSignal.timeout(5000),
      });

      // ICY metadata interval is in the response headers
      const metaInt = parseInt(res.headers.get("icy-metaint") ?? "0");
      const stationName = res.headers.get("icy-name");
      const genre = res.headers.get("icy-genre");

      if (!metaInt) {
        return c.json({
          success: true,
          data: { station: stationName, genre, title: null },
        });
      }

      // Read enough bytes to get past the audio data to the metadata block
      const reader = res.body!.getReader();
      let bytesRead = 0;
      let buffer = new Uint8Array(0);

      while (bytesRead < metaInt + 256) {
        const { done, value } = await reader.read();
        if (done) break;

        const newBuffer = new Uint8Array(buffer.length + value.length);
        newBuffer.set(buffer);
        newBuffer.set(value, buffer.length);
        buffer = newBuffer;
        bytesRead += value.length;
      }

      reader.cancel();

      // Parse ICY metadata block
      const metaBlock = buffer.slice(metaInt);
      const metaLength = metaBlock[0] * 16; // length byte × 16
      const metaString = new TextDecoder().decode(
        metaBlock.slice(1, 1 + metaLength),
      );

      // Parse "StreamTitle='Artist - Track';StreamUrl='...';"
      const titleMatch = metaString.match(/StreamTitle='([^']+)'/i);
      const title = titleMatch?.[1] ?? null;

      return c.json({
        success: true,
        data: {
          station: stationName,
          genre,
          title, // "Artist - Track Name"
        },
      });
    } catch (err) {
      return c.json(
        {
          success: false,
          error: `[server: now-playing] failed to fetch metadata from ${streamUrl}`,
        },
        500,
      );
    }
  },
);

export default app;
