import { sendMessage } from "@/lib/messaging";
import { useQuery } from "@tanstack/react-query";

export function useNowPlaying(streamUrl: string | undefined | null) {
  return useQuery({
    queryKey: ["now-playing", streamUrl],
    queryFn: ({ queryKey }) =>
      sendMessage("getNowPlaying", { streamUrl: queryKey[1]! }),
    enabled: !!streamUrl,
    refetchInterval: 30_000, // 30s in milliseconds
    staleTime: 25_000, // 25s in milliseconds
  });
}
