import { hc } from "hono/client";
import { AppType } from "@zennami/shared";

export const apiClient = hc<AppType>(import.meta.env.VITE_SERVER_URL);
export type ApiClient = typeof apiClient;
