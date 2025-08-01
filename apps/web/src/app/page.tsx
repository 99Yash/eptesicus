'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, buttonVariants } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CreateIssueDialog } from '~/components/create-issue-dialog';
import { IssueList } from '~/components/issue-list';
import { useUser } from '~/hooks/use-user';
import { api } from '~/lib/api';

export default function Page() {
  const { data: user } = useUser();
  const [showCreateDialog, setShowCreateDialog] = useState(false);

  const queryClient = useQueryClient();

  const signoutMutation = useMutation({
    mutationFn: api.signout,
    onMutate: () => {
      toast.loading('Signing out...');
    },
    onSuccess: () => {
      queryClient.setQueryData(['user'], null);
      toast.dismiss();
      toast.success('Signed out successfully');
    },
    onError: (error) => {
      toast.dismiss();
      toast.error('Failed to sign out');
    },
  });

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Only trigger if user is logged in and not typing in an input/textarea
      if (!user) return;

      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      // Check if 'C' is pressed (case insensitive)
      if (
        event.key.toLowerCase() === 'c' &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey
      ) {
        event.preventDefault();
        setShowCreateDialog(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [user]);

  return (
    <>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold">Eptesicus</h1>
              {user && (
                <p className="text-sm text-muted-foreground">
                  Hello {user.name} • Press 'C' to create a new issue
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  <Link
                    href="/signin"
                    className={cn(
                      buttonVariants({ variant: 'outline', size: 'sm' })
                    )}
                  >
                    Test signin
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => signoutMutation.mutate()}
                    disabled={signoutMutation.isPending}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <Link
                  href="/signin"
                  className={cn(
                    buttonVariants({ variant: 'outline', size: 'sm' })
                  )}
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>

          {/* Content */}
          {user ? (
            <IssueList />
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                Please sign in to view issues
              </p>
            </div>
          )}
        </div>
      </div>

      <CreateIssueDialog
        showModal={showCreateDialog}
        setShowModal={setShowCreateDialog}
      />
    </>
  );
}
