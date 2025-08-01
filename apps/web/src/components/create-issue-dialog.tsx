'use client';

import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Switch } from '@workspace/ui/components/switch';
import { Textarea } from '@workspace/ui/components/textarea';
import { useState } from 'react';
import { useCreateIssue } from '~/hooks/use-issues';
import { useUser } from '~/hooks/use-user';
import { Modal } from './ui/modal';

interface CreateIssueDialogProps {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export function CreateIssueDialog({
  showModal,
  setShowModal,
}: CreateIssueDialogProps) {
  const { data: user } = useUser();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [createMore, setCreateMore] = useState(false);

  const createIssueMutation = useCreateIssue();

  if (!user) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      return;
    }

    console.log('[CreateIssueDialog] Submitting issue:', {
      title: title.trim(),
      description: description.trim() || undefined,
      organization_id: 'default',
    });

    try {
      await createIssueMutation.mutateAsync({
        title: title.trim(),
        description: description.trim() || undefined,
        organization_id: 'default', // TODO: Get from user context or organization selector
      });

      console.log('[CreateIssueDialog] Issue created successfully');
      setShowModal(false);

      if (!createMore) {
        setTitle('');
        setDescription('');
      }
    } catch (error) {
      // Error is handled by the mutation hook
      console.error('[CreateIssueDialog] Failed to create issue:', error);
    }
  };

  const handleClose = () => {
    setShowModal(false);
    if (!createMore) {
      setTitle('');
      setDescription('');
    }
  };

  return (
    <Modal showModal={showModal} setShowModal={handleClose}>
      <div className="w-full max-w-[600px] mx-auto p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="secondary" className="flex items-center gap-1">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: 'var(--color-primary)' }}
              />
              LAB
            </Badge>
            <span>&gt;</span>
            <span>New issue</span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <Input
              placeholder="Issue title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-lg font-medium border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              disabled={createIssueMutation.isPending}
            />
            <Textarea
              placeholder="Add description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[100px] border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
              disabled={createIssueMutation.isPending}
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              disabled={createIssueMutation.isPending}
            >
              <div
                className="h-4 w-4 border-2 border-dashed rounded"
                style={{ borderColor: 'var(--color-border)' }}
              />
              Backlog
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              disabled={createIssueMutation.isPending}
            >
              <div className="h-4 w-4 flex items-center justify-center">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: 'var(--color-chart-4)' }}
                />
              </div>
              Priority
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              disabled={createIssueMutation.isPending}
            >
              <div
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: 'var(--color-muted)' }}
              />
              Assignee
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              disabled={createIssueMutation.isPending}
            >
              <div
                className="h-4 w-4 border rounded-sm relative"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <div
                  className="absolute -top-1 -right-1 h-2 w-2 rounded-full"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                />
              </div>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              disabled={createIssueMutation.isPending}
            >
              <div className="h-4 w-4 flex items-center justify-center">
                <div
                  className="w-1 h-1 rounded-full"
                  style={{ backgroundColor: 'var(--color-muted-foreground)' }}
                />
                <div
                  className="w-1 h-1 rounded-full ml-1"
                  style={{ backgroundColor: 'var(--color-muted-foreground)' }}
                />
                <div
                  className="w-1 h-1 rounded-full ml-1"
                  style={{ backgroundColor: 'var(--color-muted-foreground)' }}
                />
              </div>
            </Button>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="flex items-center gap-2"
              disabled={createIssueMutation.isPending}
            >
              <div
                className="h-4 w-4 border-b-2 border-l-2 transform rotate-45"
                style={{ borderColor: 'var(--color-muted-foreground)' }}
              />
            </Button>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  id="create-more"
                  checked={createMore}
                  onCheckedChange={setCreateMore}
                  disabled={createIssueMutation.isPending}
                />
                <Label htmlFor="create-more" className="text-sm">
                  Create more
                </Label>
              </div>
              <Button
                type="submit"
                style={{
                  backgroundColor: 'var(--color-chart-1)',
                  color: 'var(--color-primary-foreground)',
                }}
                className="hover:opacity-90"
                disabled={createIssueMutation.isPending || !title.trim()}
              >
                {createIssueMutation.isPending ? 'Creating...' : 'Create issue'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </Modal>
  );
}
