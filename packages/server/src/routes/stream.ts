import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { USER_AGENT } from "@zennami/shared";

const getStreamSchema = z.object({
  url: z.string().min(1, "A stream url is required"),
});

const app = new Hono().get(
  "/",
  zValidator("query", getStreamSchema),
  async (c) => {
    const url = decodeURIComponent(c.req.valid("query").url);

    const res = await fetch(url, {
      headers: {
        "User-Agent": USER_AGENT,
        "Icy-MetaData": "1",
      },
    });

    return new Response(res.body, {
      headers: {
        "Content-Type": res.headers.get("Content-Type") ?? "audio/mpeg",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache",
        "Transfer-Encoding": "chunked",
      },
    });
  },
);

export default app;
