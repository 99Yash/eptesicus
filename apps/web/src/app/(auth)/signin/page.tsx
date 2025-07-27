'use client';

import { authOptionsSchema, AuthOptionsType } from '@workspace/db/helpers';
import { Button } from '@workspace/ui/components/button';
import { Google } from '@workspace/ui/icons';
import { useRouter } from 'next/navigation';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import React from 'react';
import { env } from '~/env';
import { useUser } from '~/hooks/use-user';
import { getLocalStorageItem, setLocalStorageItem } from '~/lib/utils';
import { EmailSignIn } from './email-signin';
import { VerifyEmailForm } from './verify-email-form';

export default function AuthenticationPage() {
  const { data: user } = useUser();
  const router = useRouter();

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
      const lastAuthMethod = getLocalStorageItem(
        'lastAuthMethod',
        authOptionsSchema
      );
      setLastAuthMethod(lastAuthMethod ?? null);
    }
  }, []);

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
        {step === 'signin' && (
          <div className="space-y-1">
            <EmailSignIn
              onSuccess={(email: string) => {
                setEmail(email);
                setStep('verify');
              }}
            />
            {lastAuthMethod === 'EMAIL' && (
              <p className="text-xs italic text-muted-foreground text-center">
                Last used
              </p>
            )}
          </div>
        )}
        {step === 'verify' && <VerifyEmailForm email={email} />}

        {step === 'signin' && (
          <>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            <div className="space-y-1">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  // Redirect to backend OAuth endpoint. The backend will handle Google authentication and redirect back.
                  if (typeof window !== 'undefined') {
                    setLocalStorageItem<AuthOptionsType>(
                      'lastAuthMethod',
                      'GOOGLE'
                    );
                  }
                  window.location.href = `${env.NEXT_PUBLIC_API_URL}/auth/google`;
                }}
              >
                <Google className="size-5" />
                <span className="text-sm">Continue with Google</span>
              </Button>
              {lastAuthMethod === 'GOOGLE' && (
                <p className="text-xs text-muted-foreground text-center">
                  Last used
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
