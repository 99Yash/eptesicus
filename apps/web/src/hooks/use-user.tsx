import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useUser() {
  return useQuery({
    queryFn: api.getCurrentUser,
    queryKey: ['user'],
    retry: 0,
  });
}
