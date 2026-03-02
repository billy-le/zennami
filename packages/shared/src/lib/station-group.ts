// ---------------------------------------------------------------------------
// Types — mirrors the RadioBrowser API schema
// ---------------------------------------------------------------------------
import { parse as parseTld } from "tldts";
import {
  RadioStation,
  StationGroup,
  StationVariant,
} from "../types/radio-station";

// ---------------------------------------------------------------------------
// Pre-processing: filter dead streams
// ---------------------------------------------------------------------------

export function filterLiveStations(stations: RadioStation[]): RadioStation[] {
  return stations.filter((s) => s.lastcheckok === 1);
}

// ---------------------------------------------------------------------------
// Domain extraction
// ---------------------------------------------------------------------------

function extractDomain(url: string): string | null {
  if (!url) return null;
  try {
    const { domain } = parseTld(url);
    return domain ?? null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// Name normalisation & fuzzy matching
// ---------------------------------------------------------------------------

function normalizeName(name: string): string {
  return (
    name
      .toLowerCase()
      // remove bracketed labels like [1], [2], (mp3)
      .replace(/[\[(][^\])]*[\])]/g, "")
      // remove codec suffixes that sometimes leak into names
      .replace(/\b(mp3|aac\+?|ogg|opus\s*\d+)\b/gi, "")
      // remove punctuation
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim()
  );
}

function brandKey(name: string): string {
  const NOISE = new Set([
    "radio",
    "fm",
    "lofi",
    "lo fi",
    "beats",
    "music",
    "station",
    "stream",
    "online",
    "live",
    "digital",
  ]);
  const tokens = normalizeName(name).split(" ").filter(Boolean);
  const meaningful = tokens.filter((t) => !NOISE.has(t));
  return (meaningful.length > 0 ? meaningful : tokens).join(" ");
}

function levenshtein(a: string, b: string): number {
  const m = a.length,
    n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, (_, i) =>
    Array.from({ length: n + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++)
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
  return dp[m][n];
}

function isSameBrand(a: string, b: string): boolean {
  if (a === b) return true;
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return true;
  // ~15% edit distance tolerance, minimum 1
  const threshold = Math.max(1, Math.floor(maxLen * 0.15));
  return levenshtein(a, b) <= threshold;
}

// ---------------------------------------------------------------------------
// Variant label extraction
// ---------------------------------------------------------------------------

function extractVariantLabel(
  station: RadioStation,
  groupBrandName: string,
): string | null {
  // 1. Bracketed label in name — e.g. "[2]" or "(OPUS 96)"
  const bracketMatch = station.name.match(/[\[(]([^\])]+)[\])]/);
  if (bracketMatch) return bracketMatch[1].trim();

  // 2. Remainder after stripping the brand name from the station name
  const normalizedStation = normalizeName(station.name);
  const normalizedBrand = normalizeName(groupBrandName);
  const remainder = normalizedStation
    .replace(normalizedBrand, "")
    .replace(/^[\s\-|–—:#]+/, "")
    .replace(/[\s\-|–—:#]+$/, "")
    .trim();
  if (remainder.length > 0) return remainder;

  // 3. Last resort: codec + bitrate as a disambiguator
  if (station.bitrate > 0) return `${station.codec} ${station.bitrate}k`;
  if (station.codec && station.codec !== "UNKNOWN") return station.codec;

  return null;
}

// ---------------------------------------------------------------------------
// Favicon resolution — pick the most common favicon within a group
// ---------------------------------------------------------------------------

function resolveFavicon(variants: StationVariant[]): string | null {
  const counts = new Map<string, number>();
  for (const { station } of variants) {
    if (station.favicon) {
      counts.set(station.favicon, (counts.get(station.favicon) ?? 0) + 1);
    }
  }
  if (counts.size === 0) return null;
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

// ---------------------------------------------------------------------------
// Codec priority helper
// ---------------------------------------------------------------------------

const CODEC_PRIORITY: Record<string, number> = {
  "AAC+": 1,
  AAC: 2,
  MP3: 3,
  OGG: 4,
  UNKNOWN: 5,
};

function codecPriority(codec: string): number {
  return CODEC_PRIORITY[codec] ?? 99;
}

// ---------------------------------------------------------------------------
// Main grouping function
// ---------------------------------------------------------------------------

export function groupStations(rawStations: RadioStation[]): StationGroup[] {
  // Step 1 — filter dead streams
  const stations = filterLiveStations(rawStations);

  // Two buckets: domain-keyed groups and name-fuzzy groups.
  // Keeping them separate prevents a domain group from being merged with an
  // unrelated station that happens to have a similar name.
  const domainGroups = new Map<string, StationGroup>();
  const nameGroups: StationGroup[] = [];

  for (const station of stations) {
    const domain = extractDomain(station.homepage);

    // --- Primary: domain match ---
    if (domain) {
      const existing = domainGroups.get(domain);
      if (existing) {
        existing.variants.push({ station, variantLabel: null });
      } else {
        domainGroups.set(domain, {
          brandName: station.name,
          favicon: station.favicon || null,
          domain,
          groupedBy: "domain",
          variants: [{ station, variantLabel: null }],
        });
      }
      continue;
    }

    // --- Fallback: fuzzy name match ---
    const key = brandKey(station.name);
    const existing = nameGroups.find((g) =>
      isSameBrand(brandKey(g.brandName), key),
    );
    if (existing) {
      existing.variants.push({ station, variantLabel: null });
    } else {
      nameGroups.push({
        brandName: station.name,
        favicon: station.favicon || null,
        groupedBy: "name",
        variants: [{ station, variantLabel: null }],
        domain: domain ?? "",
      });
    }
  }

  const allGroups = [...domainGroups.values(), ...nameGroups];

  // Step 2 — resolve variant labels and favicons
  for (const group of allGroups) {
    if (group.variants.length > 1) {
      for (const variant of group.variants) {
        variant.variantLabel = extractVariantLabel(
          variant.station,
          group.brandName,
        );
      }
      group.favicon = resolveFavicon(group.variants);
    }

    // Sort variants: highest votes first, then by codec quality
    group.variants.sort((a, b) => {
      const voteDiff = b.station.votes - a.station.votes;
      if (voteDiff !== 0) return voteDiff;
      return codecPriority(a.station.codec) - codecPriority(b.station.codec);
    });
  }

  // Step 3 — sort groups: multi-variant groups first, then by aggregate votes
  allGroups.sort((a, b) => {
    const sizeDiff = b.variants.length - a.variants.length;
    if (sizeDiff !== 0) return sizeDiff;
    const aVotes = a.variants.reduce((s, v) => s + v.station.votes, 0);
    const bVotes = b.variants.reduce((s, v) => s + v.station.votes, 0);
    return bVotes - aVotes;
  });

  return allGroups;
}
