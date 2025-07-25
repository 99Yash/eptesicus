'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, buttonVariants } from '@workspace/ui/components/button';
import { Spinner } from '@workspace/ui/components/spinner';
import { cn } from '@workspace/ui/lib/utils';
import Link from 'next/link';
import { toast } from 'sonner';
import { useUser } from '~/hooks/use-user';
import { api } from '~/lib/api';

export default function Page() {
  const { data: user } = useUser();

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

  return (
    <div className="flex items-center justify-center min-h-svh">
      <div className="flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Eptesicus</h1>
        {user ? (
          <>
            <p className="text-sm">Hello {user.name}</p>
            <Link
              href="/signin"
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
            >
              Test signin
            </Link>
            <Button
              variant="outline"
              size="sm"
              onClick={() => signoutMutation.mutate()}
              disabled={signoutMutation.isPending}
            >
              <Spinner />
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
  );
}
