import { Hono } from "hono";
import { renderer } from "./renderer";
import stations from "./routes/stations";
import nowPlaying from "./routes/now-playing";
import stream from "./routes/stream";

const app = new Hono()
  .use(renderer)
  .route("/api/stations", stations)
  .route("/api/now-playing", nowPlaying)
  .route("/api/stream", stream);

export type AppType = typeof app;

export default app;
