'use client';

import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import { Switch } from '@workspace/ui/components/switch';
import { Textarea } from '@workspace/ui/components/textarea';
import { useState } from 'react';
import { useCreateOrganization } from '~/hooks/use-organizations';
import { useUser } from '~/hooks/use-user';
import { Modal } from '../ui/modal';

interface CreateOrganizationDialogProps {
  showModal: boolean;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
}

export function CreateOrganizationDialog({
  showModal,
  setShowModal,
}: CreateOrganizationDialogProps) {
  const { data: user } = useUser();

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [createMore, setCreateMore] = useState(false);

  const createOrgMutation = useCreateOrganization();

  if (!user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) return;

    try {
      await createOrgMutation.mutateAsync({
        name: name.trim(),
        bio: bio.trim() || undefined,
        logo_url: logoUrl.trim() || undefined,
      });

      setShowModal(false);
      if (!createMore) {
        setName('');
        setBio('');
        setLogoUrl('');
      }
    } catch (error) {
      // handled in hook
    }
  };

  const handleClose = () => {
    setShowModal(false);
    if (!createMore) {
      setName('');
      setBio('');
      setLogoUrl('');
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
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <Input
              placeholder="Organization name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="text-lg font-medium border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              disabled={createOrgMutation.isPending}
            />
            <Textarea
              placeholder="Bio (optional)"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="min-h-[80px] border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
              disabled={createOrgMutation.isPending}
            />
            <Input
              placeholder="Logo URL (optional)"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
              disabled={createOrgMutation.isPending}
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
              disabled={createOrgMutation.isPending}
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
      </div>
    </Modal>
  );
}
