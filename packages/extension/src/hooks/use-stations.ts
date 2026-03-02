import { sendMessage } from "@/lib/messaging";
import { useQuery } from "@tanstack/react-query";

export function useGroupStations() {
  return useQuery({
    queryKey: ["group-stations"],
    queryFn: () => sendMessage("getGroupStations"),
    staleTime: 1000 * 6 * 10, // 10 min — matches background cache TTL
    retry: 2,
  });
}
