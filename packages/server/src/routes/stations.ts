import { Hono } from "hono";
import { getStationsByTag, searchStations } from "../lib/radio-browser";

const app = new Hono();

app.get("/lofi", async (c) => {
  const stations = await getStationsByTag("lofi");
  return c.json(stations);
});

app.get("/search", async (c) => {
  const query = c.req.query("q") ?? "";
  const stations = await searchStations(query);
  return c.json(stations);
});

export default app;
