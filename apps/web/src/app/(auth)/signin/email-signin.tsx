'use client';

import { useMutation } from '@tanstack/react-query';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Spinner } from '@workspace/ui/components/spinner';
import { useRouter } from 'next/navigation';
import React from 'react';
import { toast } from 'sonner';
import z from 'zod';
import { api } from '~/lib/api';

const schema = z.object({
  email: z.string().email().max(255, 'Email must be less than 255 characters'),
});

export function EmailSignIn() {
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: api.login,
    onError(error, variables, context) {
      toast.error(error.message);
    },
    onSuccess(data, variables, context) {
      router.push('/');
    },
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email');

    const { success, data, error } = schema.safeParse({ email });

    if (!success) {
      toast.error(error.message);
      return;
    }

    await loginMutation.mutateAsync({ email: data.email });
  }

  return (
    <form className="grid gap-2" onSubmit={() => {}}>
      <div className="grid gap-1">
        <Input
          name="email"
          placeholder="name@example.com"
          type="email"
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect="off"
          className="bg-background"
        />
      </div>
      <Button disabled={loginMutation.isPending}>
        {loginMutation.isPending && (
          <Spinner className="mr-2 h-4 w-4 animate-spin" />
        )}
        Sign In with Email
      </Button>
    </form>
  );
}
