import type { RadioStation } from "../types/radio-station";
import { USER_AGENT } from "../const";

const BASE_URL = "https://de1.api.radio-browser.info/json";

const headers = {
  "User-Agent": USER_AGENT,
  "Content-Type": "application/json",
};

// Get stations by tag (e.g. "lofi", "chillout", "jazz")
export async function getStationsByTag(
  tag: string,
  limit = 20,
): Promise<RadioStation[]> {
  const res = await fetch(
    `${BASE_URL}/stations/bytag/${encodeURIComponent(tag)}?limit=${limit}&hidebroken=true&order=votes&reverse=true`,
    {
      headers,
    },
  );

  if (!res.ok) throw new Error(`Radio Browser API error: ${res.status}`);
  const data = (await res.json()) as unknown as RadioStation[];
  const filterList = ["france info (lofi)"];
  return data.filter((d) => !filterList.includes(d.name));
}

export async function clickStation() {}

// Search stations by name
export async function searchStations(
  query: string,
  limit = 20,
): Promise<RadioStation[]> {
  const res = await fetch(`${BASE_URL}/stations/search`, {
    method: "POST",
    headers,
    body: new URLSearchParams({
      name: query,
      limit: String(limit),
      hidebroken: "true",
      order: "votes",
      reverse: "true",
    }),
  });

  if (!res.ok) throw new Error(`Radio Browser API error: ${res.status}`);
  return res.json() as unknown as RadioStation[];
}

// Get top voted stations
export async function getTopStations(limit = 20): Promise<RadioStation[]> {
  const res = await fetch(
    `${BASE_URL}/stations?limit=${limit}&hidebroken=true&order=votes&reverse=true`,
    {
      headers,
    },
  );

  if (!res.ok) throw new Error(`Radio Browser API error: ${res.status}`);
  return res.json() as unknown as RadioStation[];
}
