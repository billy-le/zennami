import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiWrapper } from './api-wrapper';
import { usePlayerState } from '@/state/player';
import { useEffect } from 'react';
import { onMessage } from '@/lib/messaging';

const queryClient = new QueryClient()

export function App() {
  const init = usePlayerState(state => state.init);
  const setIsBuffering = usePlayerState(state => state.setIsBuffering)

  useEffect(() => {
    init()
    const unsubscribe = onMessage('setIsBuffering', async (data) => {
      console.log(data.data)
      setIsBuffering(data.data)
    })
    return () => unsubscribe()
  }, [])

  return <QueryClientProvider client={queryClient}>
    <ApiWrapper />
  </QueryClientProvider>
}

