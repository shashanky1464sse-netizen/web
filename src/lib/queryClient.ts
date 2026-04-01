import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1, // Only retry once by default
      refetchOnWindowFocus: false, // Don't refetch on window focus to avoid hammering backend
      staleTime: 5 * 60 * 1000, // Default 5 minutes stale time
    },
  },
});
