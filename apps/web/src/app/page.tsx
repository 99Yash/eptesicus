'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, buttonVariants } from '@workspace/ui/components/button';
import { Kbd } from '@workspace/ui/components/kbd';
import { cn } from '@workspace/ui/lib/utils';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CreateIssueDialog } from '~/components/issues/create-issue-dialog';
import { IssueList } from '~/components/issues/issue-list';
import { CreateOrganizationDialog } from '~/components/organizations/create-organization-dialog';
import { useOrganizations } from '~/hooks/use-organizations';
import { useUser } from '~/hooks/use-user';
import { api } from '~/lib/api';

export default function Page() {
  const { data: user } = useUser();
  const { data: organizations } = useOrganizations();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showCreateOrgDialog, setShowCreateOrgDialog] = useState(false);

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

  // Show organization dialog if user has none
  useEffect(() => {
    if (user && organizations && organizations.length === 0) {
      setShowCreateOrgDialog(true);
    }
  }, [user, organizations]);

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
        <div className="container mx-auto px-4 py-8 md:px-6 lg:px-8">
          {/* Header */}
          <header className="flex flex-col items-start justify-between gap-4 border-b pb-6 md:flex-row md:items-center md:gap-0 md:pb-8">
            <div className="space-y-1">
              <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
                Eptesicus
              </h1>
              {user && (
                <p className="text-sm text-muted-foreground">
                  Hello {user.name} • Press <Kbd>C</Kbd> to create a new issue
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {user ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => signoutMutation.mutate()}
                    disabled={signoutMutation.isPending}
                  >
                    {signoutMutation.isPending ? 'Signing Out...' : 'Sign Out'}
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
          </header>

          {/* Content */}
          <main className="py-8">
            {user ? (
              <IssueList />
            ) : (
              <div className="flex h-[calc(100vh-200px)] items-center justify-center text-center">
                <p className="text-lg text-muted-foreground">
                  Please sign in to view issues
                </p>
              </div>
            )}
          </main>
        </div>
      </div>

      <CreateIssueDialog
        showModal={showCreateDialog}
        setShowModal={setShowCreateDialog}
      />

      <CreateOrganizationDialog
        showModal={showCreateOrgDialog}
        setShowModal={setShowCreateOrgDialog}
      />
    </>
  );
}
