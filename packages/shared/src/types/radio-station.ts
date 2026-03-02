export interface RadioStation {
  bitrate: number;
  changeuuid: string;
  clickcount: number;
  clicktimestamp: string;
  clicktimestamp_iso8601: string;
  clicktrend: number;
  codec: "MP3" | "AAC" | "AAC+" | "OGG" | "UNKNOWN";
  country: string;
  countrycode: string;
  favicon: string;
  geo_distance: null;
  geo_lat: null;
  geo_long: null;
  has_extended_info: boolean;
  hls: number;
  homepage: string;
  iso_3166_2: string;
  language: string;
  languagecodes: string;
  lastchangetime: string;
  lastchangetime_iso8601: string;
  lastcheckok: number;
  lastcheckoktime: string;
  lastcheckoktime_iso8601: string;
  lastchecktime: string;
  lastchecktime_iso8601: string;
  lastlocalchecktime: string;
  lastlocalchecktime_iso8601: string;
  name: string;
  serveruuid: null;
  ssl_error: number;
  state: string;
  stationuuid: string;
  tags: string;
  url: string;
  url_resolved: string;
  votes: number;
}

export interface StationVariant {
  station: RadioStation;
  /** Differentiating label within the group, e.g. "[2]", "OPUS 96", "AAC+ 320k" */
  variantLabel: string | null;
}

export interface StationGroup {
  /** Human-readable brand name (from the first station seen in the group) */
  brandName: string;
  /** Shared favicon — most common one across variants */
  favicon: string | null;
  /** The signal used to form this group: "domain" or "name" */
  groupedBy: "domain" | "name";
  domain: string;
  variants: StationVariant[];
}
