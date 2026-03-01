import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ApiWrapper } from './api-wrapper';

const queryClient = new QueryClient()

if (window.__PLAYER_STATE__) {
  queryClient.setQueryData(['playerState'], window.__PLAYER_STATE__)
}

export function App() {
  return <QueryClientProvider client={queryClient}>
    <ApiWrapper />
  </QueryClientProvider>
}

