import { sendMessage } from "@/lib/messaging";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { RadioStation, PlayerState } from "@zennami/shared";
import { DEFAULT_PLAYER_STATE } from "@zennami/shared";

const SNAPSHOT_KEY = "player-state-snapshot";
const QUERY_KEY = ["player-state"];

function readSnapshot(): PlayerState | undefined {
  try {
    const snap = sessionStorage.getItem(SNAPSHOT_KEY);
    return snap ? JSON.parse(snap) : undefined;
  } catch {
    return undefined;
  }
}

function writeSnapshot(state: PlayerState) {
  try {
    sessionStorage.setItem(SNAPSHOT_KEY, JSON.stringify(state));
  } catch {}
}

export function usePlayerState() {
  return useQuery({
    queryKey: ["player-state"],
    queryFn: async () => {
      const state = await sendMessage("getPlayerState");
      writeSnapshot(state);
      return state;
    },
    refetchOnMount: true,
    staleTime: 0,
    initialData: () => {
      const state = readSnapshot();
      return state ?? DEFAULT_PLAYER_STATE;
    },
    initialDataUpdatedAt: 0,
  });
}

export function usePlayStation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (station: RadioStation) =>
      sendMessage("playStation", { station }),
    onMutate: async (station) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previous = queryClient.getQueryData<PlayerState>(QUERY_KEY);
      // Optimistic update — update UI immediately
      queryClient.setQueryData<PlayerState>(["playerState"], (prev) => ({
        ...prev!,
        isPlaying: true,
        currentStation: station,
      }));
      return { previous };
    },
    onError: (_err, _station, context) => {
      // Roll back on error
      if (context?.previous) {
        queryClient.setQueryData(QUERY_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function usePauseStation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => sendMessage("pauseStation"),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previous = queryClient.getQueryData<PlayerState>(QUERY_KEY);

      queryClient.setQueryData<PlayerState>(QUERY_KEY, (prev) => ({
        ...prev!,
        isPlaying: false,
      }));

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(QUERY_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useSetVolume() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (volume: number) => sendMessage("setVolume", { volume }),
    onMutate: async (volume) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previous = queryClient.getQueryData<PlayerState>(QUERY_KEY);

      queryClient.setQueryData<PlayerState>(QUERY_KEY, (prev) => ({
        ...prev!,
        volume,
      }));

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(QUERY_KEY, context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
    },
  });
}

export function useControls() {
  const { data: playerState } = usePlayerState();
  const { mutate: play } = usePlayStation();
  const { mutate: pause } = usePauseStation();
  const { mutate: volume } = useSetVolume();

  return {
    toggle: () => {
      if (playerState?.isPlaying) {
        pause();
      } else if (playerState?.currentStation) {
        play(playerState.currentStation);
      }
    },
    isPlaying: playerState?.isPlaying ?? false,
    setVolume: (v: number) => {
      volume(v);
    },
  };
}
