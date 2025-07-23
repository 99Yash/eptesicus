'use client';

import { useMutation } from '@tanstack/react-query';
import { Button } from '@workspace/ui/components/button';
import { Spinner } from '@workspace/ui/components/spinner';
import { redirect, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useUser } from '~/hooks/use-user';
import { api } from '~/lib/api';

export default function SignoutPage() {
  const { data: user } = useUser();
  const router = useRouter();

  if (!user) {
    router.push('/signin');
  }

  const signoutMutation = useMutation({
    mutationFn: api.signout,
    onMutate: () => {
      toast.loading('Signing out...');
    },
    onError: (error) => {
      toast.error('Error signing out');
    },
  });

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Sign Out</h1>
        <p className="text-sm text-muted-foreground">
          Are you sure you want to sign out?
        </p>
        <Button
          onClick={async () => {
            try {
              await signoutMutation.mutateAsync();
              redirect('/');
            } catch (error) {
              console.error('Error signing out', error);
            }
          }}
          disabled={signoutMutation.isPending}
        >
          <p className="w-full">
            {signoutMutation.isPending && <Spinner className="mr-2 h-4 w-4" />}
            Sign Out
          </p>
        </Button>
      </div>
    </div>
  );
}
