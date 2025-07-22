'use client';

import { useMutation } from '@tanstack/react-query';
import { buttonVariants } from '@workspace/ui/components/button';
import { cn } from '@workspace/ui/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useUser } from '~/hooks/use-user';
import { api } from '~/lib/api';

export default function Page() {
  const { data: user } = useUser();
  const router = useRouter();

  const signoutMutation = useMutation({
    mutationFn: api.signout,
    onMutate: () => {
      toast.loading('Signing out...');
    },
    onSuccess: () => {
      void router.refresh();
    },
    onError: (error) => {
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
            <Link
              href="/signout"
              className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}
            >
              Sign Out
            </Link>
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
