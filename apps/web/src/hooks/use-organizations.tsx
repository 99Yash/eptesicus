import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { api } from '~/lib/api';

export function useOrganizations() {
  return useQuery({
    queryKey: ['organizations'],
    queryFn: api.listOrganizations,
  });
}

export function useCreateOrganization() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createOrganization,
    onMutate: () => {
      toast.loading('Creating organization...');
    },
    onSuccess: (org) => {
      toast.dismiss();
      toast.success(`Organization "${org.name}" created`);
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
    onError: (error: any) => {
      toast.dismiss();
      toast.error(
        error?.response?.data?.message || 'Failed to create organization'
      );
    },
  });
}
