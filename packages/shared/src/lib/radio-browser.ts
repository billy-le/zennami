import type { RadioStation } from "../types/radio-station";
import { USER_AGENT } from "../const";
import { groupStations } from "./station-group";

const BASE_URL = "https://de1.api.radio-browser.info/json";

const headers = {
  "User-Agent": USER_AGENT,
  "Content-Type": "application/json",
};

export async function getAggregatedStations() {
  const tags = [
    "lofi",
    "chill",
    "relax",
    "ambient",
    "study",
    "focus",
    "downtemp",
    "piano",
  ];

  const fetchPromises = tags.map(async (tag) => {
    const url = new URL(`${BASE_URL}/stations/bytag/${tag}`);
    url.searchParams.append("limit", "50"); // Keep it small per tag
    url.searchParams.append("hidebroken", "true");
    url.searchParams.append("order", "clickcount"); // Better than 'votes' for variety
    url.searchParams.append("is_https", "true");

    return fetch(url, {
      headers,
    }).then((res) => res.json() as unknown as RadioStation[]);
  });

  // 2. Wait for all to finish (even if some fail)
  const results = await Promise.allSettled(fetchPromises);

  // 3. Flatten and de-duplicate using a Map (keyed by stationuuid)
  const stationMap = new Map<string, RadioStation>();

  results.forEach((result) => {
    if (result.status === "fulfilled") {
      result.value.forEach((station) => {
        stationMap.set(station.stationuuid, station);
      });
    }
  });

  const stations = Array.from(stationMap.values());
  return groupStations(stations).sort((a, b) =>
    a.brandName.localeCompare(b.brandName),
  );
}

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
