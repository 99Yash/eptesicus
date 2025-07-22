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
      toast.info(`Please check your inbox for further instructions.`);
      router.push('/');
    },
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const formData = new FormData(e.currentTarget);

    const { success, data, error } = schema.safeParse(
      Object.fromEntries(formData)
    );

    if (!success) {
      toast.error(error.message);
      return;
    }

    await loginMutation.mutateAsync({
      email: data.email,
    });
  }

  return (
    <form className="grid gap-2" onSubmit={handleSubmit}>
      <div className="grid gap-1">
        <Input
          name="email"
          placeholder="name@example.com"
          type="email"
          autoCapitalize="none"
          autoComplete="email"
          autoCorrect="off"
          className="bg-background"
          required
        />
      </div>
      <Button disabled={loginMutation.isPending}>
        {loginMutation.isPending ? (
          <Spinner className="mr-2" />
        ) : (
          'Sign In with Email'
        )}
      </Button>
    </form>
  );
}
