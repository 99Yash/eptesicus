'use client';

import { useRouter } from 'next/navigation';
import { parseAsStringLiteral, useQueryState } from 'nuqs';
import React from 'react';
import { OAuthButtons } from '~/app/(auth)/signin/oauth-buttons';
import { useUser } from '~/hooks/use-user';
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
            ? 'Select an authentication method to continue'
            : 'Enter the code sent to your email below to verify your email'}
        </p>
      </div>
      <div className="grid gap-6">
        {step === 'verify' && <VerifyEmailForm email={email} />}

        {step === 'signin' && (
          <>
            <div className="space-y-1">
              <OAuthButtons />
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
              <EmailSignIn
                onSuccess={(email: string) => {
                  setEmail(email);
                  setStep('verify');
                }}
              />
            </div>
          </>
        )}

        {step === 'verify' && <VerifyEmailForm email={email} />}
      </div>
    </div>
  );
}
