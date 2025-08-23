'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from '@workspace/ui/components/form';
import { Input } from '@workspace/ui/components/input';
import { Textarea } from '@workspace/ui/components/textarea';
import React from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { useUser } from '~/hooks/use-user';
import { api } from '~/lib/api';
import { getErrorMessage } from '~/lib/utils';
import { Modal } from '../ui/modal';

const organizationFormSchema = z.object({
  name: z.string().min(1, 'Organization name is required'),
  bio: z.string().optional(),
  logoUrl: z.string().optional(),
});

type OrganizationFormValues = z.infer<typeof organizationFormSchema>;

interface CreateOrganizationDialogProps {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export function CreateOrganizationDialog({
  showModal,
  setShowModal,
}: CreateOrganizationDialogProps) {
  const { data: user } = useUser();

  const queryClient = useQueryClient();

  const createOrgMutation = useMutation({
    mutationFn: api.createOrganization,
    onMutate: () => {
      toast.loading('Creating organization...');
    },
    onSuccess: (org) => {
      toast.dismiss();
      toast.success(`Organization "${org.name}" created`);
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
    },
    onError: (error) => {
      toast.dismiss();
      toast.error(getErrorMessage(error));
    },
  });

  const nameInputRef = React.useRef<HTMLInputElement>(null);
  const bioTextareaRef = React.useRef<HTMLTextAreaElement>(null);
  const logoUrlInputRef = React.useRef<HTMLInputElement>(null);
  const hasFocusedNameInputRef = React.useRef<boolean>(false);

  const setNameInputRef = React.useCallback((node: HTMLInputElement | null) => {
    nameInputRef.current = node;

    if (node === null) {
      hasFocusedNameInputRef.current = false; // reset when unmounted/closed
      return;
    }

    if (!hasFocusedNameInputRef.current) {
      node.focus();
      hasFocusedNameInputRef.current = true;
    }
  }, []);

  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: {
      name: '',
      bio: '',
      logoUrl: '',
    },
  });

  if (!user) return null;

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.metaKey) {
      e.preventDefault();
      bioTextareaRef.current?.focus();
    } else if (e.key === 'Enter' && e.metaKey) {
      e.preventDefault();
      form.handleSubmit(onSubmit)();
    }
  };

  const handleBioKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.metaKey) {
      e.preventDefault();
      logoUrlInputRef.current?.focus();
    } else if (e.key === 'Enter' && e.metaKey) {
      e.preventDefault();
      form.handleSubmit(onSubmit)();
    }
  };

  const handleLogoUrlKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.metaKey) {
      e.preventDefault();
      form.handleSubmit(onSubmit)();
    }
  };

  const onSubmit = async (values: OrganizationFormValues) => {
    if (createOrgMutation.isPending) return; // prevent duplicate submissions

    await createOrgMutation.mutateAsync({
      name: values.name.trim(),
      bio: values.bio?.trim() || undefined,
      logo_url: values.logoUrl?.trim() || undefined,
    });

    setShowModal(false);
    form.reset();
  };

  return (
    <Modal
      showModal={showModal}
      setShowModal={(show) => {
        setShowModal(false);
        form.reset();
      }}
    >
      <div className="w-full max-w-[600px] mx-auto p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Badge variant="secondary" className="flex items-center gap-1">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: 'var(--color-primary)' }}
              />
              ORG
            </Badge>
            <span>&gt;</span>
            <span>New organization</span>
          </div>
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-3">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => {
                  const { ref, ...fieldProps } = field;
                  return (
                    <FormItem>
                      <FormControl>
                        <Input
                          autoFocus
                          variant="transparent"
                          placeholder="Organization name"
                          disabled={createOrgMutation.isPending}
                          onKeyDown={handleNameKeyDown}
                          ref={(el) => {
                            setNameInputRef(el);
                            ref(el);
                          }}
                          {...fieldProps}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => {
                  const { ref, ...fieldProps } = field;
                  return (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="Bio (optional)"
                          variant="transparent"
                          disabled={createOrgMutation.isPending}
                          onKeyDown={handleBioKeyDown}
                          ref={(el) => {
                            bioTextareaRef.current = el;
                            ref(el);
                          }}
                          {...fieldProps}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
              <FormField
                control={form.control}
                name="logoUrl"
                render={({ field }) => {
                  const { ref, ...fieldProps } = field;
                  return (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Logo URL (optional)"
                          className="border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                          disabled={createOrgMutation.isPending}
                          onKeyDown={handleLogoUrlKeyDown}
                          ref={(el) => {
                            logoUrlInputRef.current = el;
                            ref(el);
                          }}
                          {...fieldProps}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                disabled={createOrgMutation.isPending}
                onClick={() => setShowModal(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={
                  createOrgMutation.isPending || !form.watch('name').trim()
                }
              >
                {createOrgMutation.isPending
                  ? 'Creating...'
                  : 'Create Organization'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Modal>
  );
}
