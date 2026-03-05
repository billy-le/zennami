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
      try {
        const state = await sendMessage("getPlayerState");
        writeSnapshot(state);
        return state;
      } catch (err) {
        console.error(err);
      }
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
    mutationFn: async (station: RadioStation) => {
      try {
        return sendMessage("playStation", { station });
      } catch (err) {
        console.error(err);
      }
    },
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
    mutationFn: async () => {
      try {
        return sendMessage("pauseStation");
      } catch (err) {
        console.error(err);
      }
    },
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

export function usePrevStation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        sendMessage("prevStation");
      } catch (err) {
        console.error(err);
      }
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previous = queryClient.getQueryData<PlayerState>(QUERY_KEY);

      // Optimistically show playing state while we wait
      queryClient.setQueryData<PlayerState>(QUERY_KEY, (prev) => ({
        ...prev!,
        isPlaying: true,
      }));

      return { previous };
    },
    onSuccess: (data) => {
      // Background returns updated PlayerState with new station
      queryClient.setQueryData(QUERY_KEY, data);
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

export function useNextStation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        return sendMessage("nextStation");
      } catch (err) {
        console.error(err);
      }
    },
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY });
      const previous = queryClient.getQueryData<PlayerState>(QUERY_KEY);

      queryClient.setQueryData<PlayerState>(QUERY_KEY, (prev) => ({
        ...prev!,
        isPlaying: true,
      }));

      return { previous };
    },
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEY, data);
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
    mutationFn: async (volume: number) => {
      try {
        return await sendMessage("setVolume", { volume });
      } catch (err) {
        console.log(err);
      }
    },
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
  const { mutate: prev } = usePrevStation();
  const { mutate: next } = useNextStation();

  return {
    toggle: () => {
      if (playerState?.isPlaying) {
        pause();
      } else if (playerState?.currentStation) {
        play(playerState.currentStation);
      }
    },
    isPlaying: playerState?.isPlaying ?? false,
    volume: playerState?.volume,
    setVolume: (v: number) => {
      volume(v);
    },
    toggleMute: async () => {
      try {
        return await sendMessage("toggleMute");
      } catch (err) {
        console.error(err);
      }
    },
    next,
    prev,
    play,
  };
}
