'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@workspace/ui/components/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@workspace/ui/components/form';
import { Input } from '@workspace/ui/components/input';
import { Switch } from '@workspace/ui/components/switch';
import { Textarea } from '@workspace/ui/components/textarea';
import { CircleIcon, MoreHorizontal, Paperclip, Tag, User } from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useCreateIssue } from '~/hooks/use-issues';
import { useOrganizations } from '~/hooks/use-organizations';
import { useUser } from '~/hooks/use-user';
import { Modal } from '../ui/modal';

const issueFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
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
  const { data: organizations } = useOrganizations();
  const orgId = organizations?.[0]?.id;

  const [createMore, setCreateMore] = React.useState(false);

  const createIssueMutation = useCreateIssue();
  const titleInputRef = React.useRef<HTMLInputElement>(null);
  const descriptionTextareaRef = React.useRef<HTMLTextAreaElement>(null);

  const form = useForm<IssueFormValues>({
    resolver: zodResolver(issueFormSchema),
    defaultValues: {
      title: '',
      description: '',
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
        organization_id: orgId,
      });

      console.log('[CreateIssueDialog] Issue created successfully');
      setShowModal(false);

      if (!createMore) {
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
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 text-sm border border-border hover:bg-muted"
                  disabled={createIssueMutation.isPending}
                >
                  <CircleIcon size={14} className="text-muted-foreground" />
                  <span className="text-foreground">Todo</span>
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 text-sm border border-border hover:bg-muted"
                  disabled={createIssueMutation.isPending}
                >
                  <div className="flex gap-1">
                    <div className="w-1 h-3 rounded-full bg-muted-foreground/60" />
                    <div className="w-1 h-3 rounded-full bg-muted-foreground/60" />
                    <div className="w-1 h-3 rounded-full bg-muted-foreground/60" />
                  </div>
                  <span className="text-muted-foreground">Priority</span>
                </Button>

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
