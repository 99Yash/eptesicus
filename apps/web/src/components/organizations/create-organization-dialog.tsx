'use client';

import { zodResolver } from '@hookform/resolvers/zod';
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
import { Label } from '@workspace/ui/components/label';
import { Switch } from '@workspace/ui/components/switch';
import { Textarea } from '@workspace/ui/components/textarea';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { useCreateOrganization } from '~/hooks/use-organizations';
import { useUser } from '~/hooks/use-user';
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

  const [createMore, setCreateMore] = useState(false);

  const createOrgMutation = useCreateOrganization();
  const nameInputRef = useRef<HTMLInputElement>(null);
  const bioTextareaRef = useRef<HTMLTextAreaElement>(null);
  const logoUrlInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationFormSchema),
    defaultValues: {
      name: '',
      bio: '',
      logoUrl: '',
    },
  });

  // Focus name input when modal opens
  useEffect(() => {
    if (showModal && nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, [showModal]);

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
    try {
      await createOrgMutation.mutateAsync({
        name: values.name.trim(),
        bio: values.bio?.trim() || undefined,
        logo_url: values.logoUrl?.trim() || undefined,
      });

      setShowModal(false);
      if (!createMore) {
        form.reset();
      }
    } catch (error) {
      // handled in hook
    }
  };

  const handleClose = () => {
    setShowModal(false);
    if (!createMore) {
      form.reset();
    }
  };

  return (
    <Modal showModal={showModal} setShowModal={handleClose}>
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
                          placeholder="Organization name"
                          className="text-lg font-medium border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                          disabled={createOrgMutation.isPending}
                          onKeyDown={handleNameKeyDown}
                          ref={(el) => {
                            nameInputRef.current = el;
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
                          className="min-h-[80px] border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
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
                onClick={handleClose}
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
              {/* Create more toggle */}
              <div className="ml-auto flex items-center gap-2 text-sm">
                <Label htmlFor="create-more">Create more</Label>
                <Switch
                  id="create-more"
                  checked={createMore}
                  onCheckedChange={setCreateMore}
                />
              </div>
            </div>
          </form>
        </Form>
      </div>
    </Modal>
  );
}
