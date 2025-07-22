import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useUser() {
  const query = useQuery({
    queryFn: api.getCurrentUser,
    queryKey: ['user'],
    retry: 0,
  });
  if (typeof window !== 'undefined') {
    // Log user and error state on the client
    console.log('[useUser] user:', query.data, 'error:', query.error);
  }
  return query;
}
