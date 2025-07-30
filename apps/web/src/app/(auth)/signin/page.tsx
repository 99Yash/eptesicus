'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AuthOptionsType } from '@workspace/db/helpers';
import { Button } from '@workspace/ui/components/button';
import { Spinner } from '@workspace/ui/components/spinner';
import { Google } from '@workspace/ui/icons';
import { useRouter } from 'next/navigation';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import React from 'react';
import { toast } from 'sonner';
import { useUser } from '~/hooks/use-user';
import { googleAuthPopup } from '~/lib/google-auth';
import {
  getErrorMessage,
  getLocalStorageItem,
  setLocalStorageItem,
} from '~/lib/utils';
import { EmailSignIn } from './email-signin';
import { VerifyEmailForm } from './verify-email-form';

export default function AuthenticationPage() {
  const { data: user } = useUser();
  const router = useRouter();
  const queryClient = useQueryClient();

  const [step, setStep] = useQueryState(
    'step',
    parseAsStringLiteral(['signin', 'verify'] as const)
      .withDefault('signin')
      .withOptions({
        history: 'replace',
      })
  );
  const [email, setEmail] = React.useState('');

  const [lastAuthMethod, setLastAuthMethod] =
    React.useState<AuthOptionsType | null>(null);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const lastAuthMethod = getLocalStorageItem('LAST_AUTH_METHOD');
      setLastAuthMethod(lastAuthMethod ?? null);
    }
  }, []);

  // Google OAuth mutation
  const googleMutation = useMutation({
    mutationFn: googleAuthPopup,
    onError(error) {
      toast.error(getErrorMessage(error));
    },
    async onSuccess() {
      // Invalidate user query so useUser fetches fresh data
      await queryClient.invalidateQueries();
      toast.success('Signed in with Google');
      router.push('/');
    },
  });

  if (user) {
    router.push('/');
  }

  React.useEffect(() => {
    if (step === 'verify' && !email) {
      setStep('signin');
    }
  }, [step, email, setStep]);

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {step === 'signin' ? 'Create an account' : 'Verify your email'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {step === 'signin'
            ? 'Enter your email below to create your account'
            : 'Enter the code sent to your email below to verify your email'}
        </p>
      </div>
      <div className="grid gap-6">
        {step === 'verify' && <VerifyEmailForm email={email} />}

        {step === 'signin' && (
          <>
            <div className="space-y-1">
              <EmailSignIn
                onSuccess={(email: string) => {
                  setEmail(email);
                  setStep('verify');
                }}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  or
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <Button
                variant="outline"
                className="w-full relative"
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    setLocalStorageItem('LAST_AUTH_METHOD', 'GOOGLE');
                  }
                  googleMutation.mutate();
                }}
              >
                <Google className="size-5" />
                <span className="text-sm">
                  {googleMutation.isPending
                    ? 'Signing in…'
                    : 'Continue with Google'}
                </span>
                {googleMutation.isPending ? (
                  <Spinner className="mr-2 bg-background" />
                ) : (
                  lastAuthMethod === 'GOOGLE' && (
                    <p className="text-xs absolute right-4 text-muted-foreground text-center">
                      Last used
                    </p>
                  )
                )}
              </Button>
            </div>
          </>
        )}

        {step === 'verify' && <VerifyEmailForm email={email} />}
      </div>
    </div>
  );
}
