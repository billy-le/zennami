import { Hono } from "hono";
import { getStationsByTag, searchStations } from "@zennami/shared";

const app = new Hono()
  .get("/lofi", async (c) => {
    const stations = await getStationsByTag("lofi");
    return c.json(stations);
  })
  .get("/search", async (c) => {
    const query = c.req.query("q") ?? "";
    const stations = await searchStations(query);
    return c.json(stations);
  });

export default app;
