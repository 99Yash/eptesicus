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
  name: z.string().min(1).max(255, 'Name must be less than 255 characters'),
  username: z
    .string()
    .min(1)
    .max(255, 'Username must be less than 255 characters'),
});

export function EmailSignIn() {
  const router = useRouter();

  const loginMutation = useMutation({
    mutationFn: api.login,
    onError(error, variables, context) {
      toast.error(error.message);
    },
    onSuccess(data, variables, context) {
      toast.info(
        `Please check your inbox for further instructions. If you don't see it, check your spam folder. Code: ${data.token}`
      );
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
      name: data.name,
      username: data.username,
    });
  }

  return (
    <form className="grid gap-2" onSubmit={handleSubmit}>
      <div className="grid gap-1">
        <div className="grid gap-1.5 grid-cols-2">
          <Input
            name="name"
            placeholder="Name"
            type="text"
            autoCapitalize="none"
            autoComplete="name"
            autoCorrect="off"
            className="bg-background"
            required
          />
          <Input
            name="username"
            placeholder="Username"
            type="text"
            autoCapitalize="none"
            autoComplete="username"
            autoCorrect="off"
            className="bg-background"
            required
          />
        </div>
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
        {loginMutation.isPending && (
          <Spinner className="mr-2 h-4 w-4 animate-spin" />
        )}
        Sign In with Email
      </Button>
    </form>
  );
}
