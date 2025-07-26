import { useMutation } from '@tanstack/react-query';
import { Button } from '@workspace/ui/components/button';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@workspace/ui/components/input-otp';
import { Spinner } from '@workspace/ui/components/spinner';
import { useRouter } from 'next/navigation';
import React from 'react';
import { toast } from 'sonner';
import z from 'zod';
import { api } from '~/lib/api';

const verifyEmailSchema = z.object({
  code: z.string().min(1, 'Code is required'),
});

type VerifyEmailFormProps = {
  email: string;
};

export function VerifyEmailForm({ email }: VerifyEmailFormProps) {
  const router = useRouter();

  const verifyMutation = useMutation({
    mutationFn: api.verifyEmail,
    onError(error) {
      toast.error(error.message);
    },
    onSuccess() {
      toast.success('Email verified');
      router.push('/');
    },
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const { success, data, error } = verifyEmailSchema.safeParse(
      Object.fromEntries(formData)
    );
    if (!success) {
      toast.error(error.message);
      return;
    }
    await verifyMutation.mutateAsync({
      email,
      code: data.code,
    });
  }

  return (
    <form className="grid gap-2" onSubmit={handleSubmit}>
      <div className="grid gap-1.5 place-content-center">
        <InputOTP maxLength={8} autoFocus className="bg-background">
          <InputOTPGroup>
            {/* TODO: use 8 as a constant */}
            {Array.from({ length: 8 }).map((_, index) => (
              <InputOTPSlot key={index} index={index} />
            ))}
          </InputOTPGroup>
        </InputOTP>
      </div>
      <Button disabled={verifyMutation.isPending}>
        {verifyMutation.isPending ? (
          <Spinner className="mr-2" />
        ) : (
          'Verify Email'
        )}
      </Button>
    </form>
  );
}
