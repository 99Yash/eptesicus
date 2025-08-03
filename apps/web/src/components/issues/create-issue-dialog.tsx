'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@workspace/ui/components/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@workspace/ui/components/form';
import { Input } from '@workspace/ui/components/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { Switch } from '@workspace/ui/components/switch';
import { Textarea } from '@workspace/ui/components/textarea';
import { MoreHorizontal, Paperclip, Tag, User } from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { useUser } from '~/hooks/use-user';
import { api, type CreateIssueData } from '~/lib/api';
import {
  ISSUE_PRIORITY_OPTIONS as PRIORITY_OPTIONS,
  ISSUE_STATUS_OPTIONS as STATUS_OPTIONS,
} from '~/lib/constants';
import { Modal } from '../ui/modal';

const issueFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  todo_status: z.enum([
    'backlog',
    'todo',
    'in_progress',
    'in_review',
    'done',
    'cancelled',
    'duplicate',
  ] as const),
  todo_priority: z.enum([
    'no_priority',
    'urgent',
    'high',
    'medium',
    'low',
  ] as const),
});

type IssueFormValues = z.infer<typeof issueFormSchema>;

interface CreateIssueDialogProps {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export function CreateIssueDialog({
  showModal,
  setShowModal,
}: CreateIssueDialogProps) {
  const { data: user } = useUser();
  const { data: organizations } = useQuery({
    queryKey: ['organizations'],
    queryFn: api.listOrganizations,
  });
  const orgId = organizations?.[0]?.id;

  const [createMore, setCreateMore] = React.useState(false);

  const queryClient = useQueryClient();

  const createIssueMutation = useMutation({
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

  const titleInputRef = React.useRef<HTMLInputElement>(null);
  const descriptionTextareaRef = React.useRef<HTMLTextAreaElement>(null);

  const form = useForm<IssueFormValues>({
    resolver: zodResolver(issueFormSchema),
    defaultValues: {
      title: '',
      description: '',
      todo_status: 'todo',
      todo_priority: 'no_priority',
    },
  });

  // Focus title input when modal opens
  React.useEffect(() => {
    if (showModal && titleInputRef.current) {
      titleInputRef.current.focus();
    }
  }, [showModal]);

  if (!user || !orgId) {
    return null; // Either not logged in or org not ready
  }

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.metaKey) {
      e.preventDefault();
      descriptionTextareaRef.current?.focus();
    } else if (e.key === 'Enter' && e.metaKey) {
      e.preventDefault();
      form.handleSubmit(onSubmit)();
    }
  };

  const handleDescriptionKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    if (e.key === 'Enter' && e.metaKey) {
      e.preventDefault();
      form.handleSubmit(onSubmit)();
    }
  };

  const onSubmit = async (values: IssueFormValues) => {
    console.log('[CreateIssueDialog] Submitting issue:', {
      title: values.title.trim(),
      description: values.description?.trim() || undefined,
      organization_id: orgId,
    });

    try {
      await createIssueMutation.mutateAsync({
        title: values.title.trim(),
        description: values.description?.trim() || undefined,
        todo_status: values.todo_status,
        todo_priority: values.todo_priority,
        organization_id: orgId,
      });

      console.log('[CreateIssueDialog] Issue created successfully');

      if (createMore) {
        // Reset form but keep modal open
        form.reset();
        // Focus back to title input for quick creation
        setTimeout(() => {
          titleInputRef.current?.focus();
        }, 0);
      } else {
        // Close modal and reset form
        setShowModal(false);
        form.reset();
      }
    } catch (error) {
      // Error is handled by the mutation hook
      console.error('[CreateIssueDialog] Failed to create issue:', error);
    }
  };

  return (
    <Modal className="p-0" showModal={showModal} setShowModal={setShowModal}>
      <div
        className="rounded-lg shadow-2xl w-full max-w-[600px] mx-auto overflow-hidden bg-card text-card-foreground"
        style={{ maxHeight: '74vh', height: 'fit-content' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-6 h-6 rounded flex items-center justify-center bg-primary/10">
              <div className="w-3 h-3 rounded-sm bg-primary" />
            </div>
            <span className="">LAB</span>
            <span className="text-muted">›</span>
            <span>New issue</span>
          </div>
        </div>

        {/* Form */}
        <div className="p-4 space-y-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => {
                  const { ref, ...fieldProps } = field;
                  return (
                    <FormItem>
                      <FormControl>
                        <Input
                          autoFocus
                          variant="transparent"
                          placeholder="Issue title"
                          disabled={createIssueMutation.isPending}
                          onKeyDown={handleTitleKeyDown}
                          ref={(el) => {
                            titleInputRef.current = el;
                            ref(el);
                          }}
                          {...fieldProps}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => {
                  const { ref, ...fieldProps } = field;
                  return (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Add description…"
                          variant="transparent"
                          disabled={createIssueMutation.isPending}
                          onKeyDown={handleDescriptionKeyDown}
                          ref={(el) => {
                            descriptionTextareaRef.current = el;
                            ref(el);
                          }}
                          {...fieldProps}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              {/* Action Buttons */}
              <div className="flex items-center gap-2 flex-wrap py-2">
                <FormField
                  control={form.control}
                  name="todo_status"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={createIssueMutation.isPending}
                    >
                      <SelectTrigger
                        size="sm"
                        className="flex items-center gap-2 text-sm border border-border hover:bg-muted capitalize"
                      >
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            STATUS_OPTIONS.find((o) => o.value === field.value)
                              ?.color
                          }`}
                        />
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            className="capitalize flex items-center gap-2"
                          >
                            <span
                              className={`w-2.5 h-2.5 rounded-full ${option.color}`}
                            />
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />

                <FormField
                  control={form.control}
                  name="todo_priority"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={createIssueMutation.isPending}
                    >
                      <SelectTrigger
                        size="sm"
                        className="flex items-center gap-2 text-sm border border-border hover:bg-muted capitalize"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PRIORITY_OPTIONS.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            className="capitalize"
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 text-sm border border-border hover:bg-muted"
                  disabled={createIssueMutation.isPending}
                >
                  <User size={14} className="text-muted-foreground" />
                  <span className="text-muted-foreground">Assignee</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 text-sm border border-border hover:bg-muted"
                  disabled={createIssueMutation.isPending}
                >
                  <Tag size={14} className="text-muted-foreground" />
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="w-8 h-8 text-sm border border-border hover:bg-muted"
                  disabled={createIssueMutation.isPending}
                >
                  <MoreHorizontal size={14} className="text-muted-foreground" />
                </Button>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="p-2 hover:bg-muted"
                  disabled={createIssueMutation.isPending}
                >
                  <Paperclip size={16} className="text-muted-foreground" />
                </Button>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-sm text-foreground">
                    <Switch
                      id="create-more"
                      checked={createMore}
                      onCheckedChange={setCreateMore}
                      disabled={createIssueMutation.isPending}
                    />
                    Create more
                  </label>

                  <Button
                    type="submit"
                    disabled={
                      createIssueMutation.isPending ||
                      !form.watch('title').trim()
                    }
                  >
                    {createIssueMutation.isPending
                      ? 'Creating...'
                      : 'Create issue'}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </div>
      </div>
    </Modal>
  );
}
