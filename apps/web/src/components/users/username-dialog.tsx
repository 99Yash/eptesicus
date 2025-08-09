'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@workspace/ui/components/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@workspace/ui/components/form';
import { Input } from '@workspace/ui/components/input';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { useUser } from '~/hooks/use-user';
import { api } from '~/lib/api';
import { getErrorMessage, removeSessionStorageItem } from '~/lib/utils';
import { Modal } from '../ui/modal';

const usernameSchema = z
  .string()
  .trim()
  .min(3, 'Username must be at least 3 characters long')
  .max(50, 'Username must be less than 50 characters')
  .regex(
    /^[a-z0-9_-]+$/,
    'Only lowercase letters, numbers, underscores and hyphens'
  );

type FormValues = { username: string };

export function UsernameDialog({
  showModal,
  setShowModal,
}: {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const { data: user } = useUser();
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(z.object({ username: usernameSchema })),
    defaultValues: { username: '' },
    mode: 'onChange',
  });

  useEffect(() => {
    // Pre-fill with current username if available to suggest editing
    if (user?.username && showModal) {
      form.setValue('username', user.username);
    }
  }, [user?.username, showModal, form]);

  const checkUsername = async (username: string) => {
    const result = await api.checkUsernameAvailability(username);
    if (!result.available) {
      form.setError('username', { type: 'manual', message: result.message });
      return false;
    }
    return true;
  };

  const updateMutation = useMutation({
    mutationFn: async (values: FormValues) => {
      const desired = values.username.trim();
      // If unchanged, allow closing without API call
      if (user?.username && user.username === desired) {
        return user;
      }
      const ok = await checkUsername(desired);
      if (!ok) throw new Error('Username not available');
      return api.updateUsername(desired);
    },
    onMutate: () => toast.loading('Updating username...'),
    onError: (err) => {
      toast.dismiss();
      toast.error(getErrorMessage(err));
    },
    onSuccess: () => {
      toast.dismiss();
      toast.success('Username updated');
      removeSessionStorageItem('SHOW_USERNAME_MODAL');
      queryClient.invalidateQueries({ queryKey: ['user'] });
      setShowModal(false);
    },
  });

  const onSubmit = async (values: FormValues) => {
    await updateMutation.mutateAsync({ username: values.username.trim() });
  };

  return (
    <Modal
      showModal={showModal}
      setShowModal={setShowModal}
      preventDefaultClose
    >
      <div className="w-full max-w-[480px] mx-auto p-6 space-y-4">
        <div className="space-y-1">
          <h2 className="text-xl font-semibold">Add a username</h2>
          <p className="text-sm text-muted-foreground">
            Choose a unique username. You can change it later.
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      autoFocus
                      placeholder="your username"
                      value={field.value}
                      onChange={(e) =>
                        field.onChange(e.target.value.toLowerCase())
                      }
                      disabled={updateMutation.isPending}
                      className="bg-background"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-end gap-2">
              <Button
                type="submit"
                disabled={
                  updateMutation.isPending ||
                  !form.formState.isValid ||
                  !form.watch('username').trim()
                }
              >
                {updateMutation.isPending ? 'Saving...' : 'Save username'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Modal>
  );
}
