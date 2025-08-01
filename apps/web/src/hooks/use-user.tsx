import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: api.getCurrentUser,
    retry: false,
  });
}
