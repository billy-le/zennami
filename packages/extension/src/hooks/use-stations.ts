import { sendMessage } from "@/lib/messaging";
import { useQuery } from "@tanstack/react-query";

export function useStations(tag: string) {
  return useQuery({
    queryKey: ["stations", tag],
    queryFn: () => sendMessage("getStations"),
    staleTime: 1000 * 6 * 10, // 10 min — matches background cache TTL
    retry: 2,
  });
}
