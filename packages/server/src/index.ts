import { Hono } from "hono";
import { renderer } from "./renderer";
import stations from "./routes/stations";
import nowPlaying from "./routes/now-playing";

const app = new Hono()
  .use(renderer)
  .route("/api/stations", stations)
  .route("/api/now-playing", nowPlaying);

export type AppType = typeof app;

export default app;
