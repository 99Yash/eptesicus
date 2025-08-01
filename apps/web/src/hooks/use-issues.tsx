import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { type IssueUpdateType } from '@workspace/db/helpers';
import { toast } from 'sonner';
import { api, type CreateIssueData } from '~/lib/api';

export function useIssues(params?: { organization_id?: string }) {
  return useQuery({
    queryKey: ['issues', params],
    queryFn: () => api.listIssues(params),
  });
}

export function useIssue(id: string) {
  return useQuery({
    queryKey: ['issues', id],
    queryFn: () => api.getIssue(id),
    enabled: !!id,
  });
}

export function useCreateIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateIssueData) => api.createIssue(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      toast.success('Issue created successfully');
    },
    onError: (error) => {
      console.error('[useCreateIssue] error:', error);
      toast.error('Failed to create issue');
    },
  });
}

export function useUpdateIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: IssueUpdateType }) =>
      api.updateIssue(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      queryClient.invalidateQueries({ queryKey: ['issues', id] });
      toast.success('Issue updated successfully');
    },
    onError: (error) => {
      console.error('[useUpdateIssue] error:', error);
      toast.error('Failed to update issue');
    },
  });
}

export function useDeleteIssue() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.deleteIssue,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['issues'] });
      toast.success('Issue deleted successfully');
    },
    onError: (error) => {
      console.error('[useDeleteIssue] error:', error);
      toast.error('Failed to delete issue');
    },
  });
}
