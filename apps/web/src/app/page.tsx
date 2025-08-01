'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, buttonVariants } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CreateIssueDialog } from '~/components/create-issue-dialog';
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
      <div className="flex items-center justify-center w-full min-h-full py-4">
        <div className="flex flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-bold">Eptesicus</h1>
          {user ? (
            <>
              <p className="text-sm">Hello {user.name}</p>
              <p className="text-xs text-muted-foreground">
                Press 'C' to create a new issue
              </p>
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
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
            >
              Sign In
            </Link>
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
