'use client';

import { useMutation } from '@tanstack/react-query';
import { AuthOptionsType } from '@workspace/db/helpers';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Spinner } from '@workspace/ui/components/spinner';
import React from 'react';
import { toast } from 'sonner';
import z from 'zod';
import { api } from '~/lib/api';
import {
  getErrorMessage,
  getLocalStorageItem,
  setLocalStorageItem,
} from '~/lib/utils';

const schema = z.object({
  email: z.string().email().max(255, 'Email must be less than 255 characters'),
});

type EmailSignInProps = {
  onSuccess: (email: string) => void;
};

export function EmailSignIn({ onSuccess }: EmailSignInProps) {
  const [lastAuthMethod, setLastAuthMethod] =
    React.useState<AuthOptionsType | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const lastAuthMethod = getLocalStorageItem('LAST_AUTH_METHOD');
      setLastAuthMethod(lastAuthMethod ?? null);
    }
  }, []);

  const loginMutation = useMutation({
    mutationFn: api.login,
    onError(error) {
      toast.error(getErrorMessage(error));
    },
    onSuccess(data, variables) {
      // Persist last used auth method
      if (typeof window !== 'undefined') {
        setLocalStorageItem('LAST_AUTH_METHOD', 'EMAIL');
        // If first-time signup (201), set flag to show username modal after verification
        try {
          if ((data as any)?.wasCreated) {
            sessionStorage.setItem('SHOW_USERNAME_MODAL', '1');
          }
        } catch {}
      }
      onSuccess(variables.email);
      toast.info(`Please check your inbox for further instructions.`);
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
      <Button
        disabled={loginMutation.isPending}
        type="submit"
        className="relative"
      >
        {loginMutation.isPending ? (
          <Spinner className="mr-2 bg-background" />
        ) : (
          'Sign In with Email'
        )}
        {lastAuthMethod === 'EMAIL' && (
          <i className="text-xs absolute right-4 text-muted text-center">
            Last used
          </i>
        )}
      </Button>
    </form>
  );
}
