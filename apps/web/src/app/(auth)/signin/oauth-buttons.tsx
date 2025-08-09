'use client';

import { useMutation } from '@tanstack/react-query';
import { AuthOptionsType } from '@workspace/db/helpers';
import { Button } from '@workspace/ui/components/button';
import { Spinner } from '@workspace/ui/components/spinner';
import { useRouter } from 'next/navigation';
import React from 'react';
import { toast } from 'sonner';
import { oauthPopup } from '~/lib/oauth-popup';
import {
  getProviderById,
  OAUTH_PROVIDERS,
  OAuthProviderId,
} from '~/lib/oauth-providers';
import {
  getErrorMessage,
  getLocalStorageItem,
  setLocalStorageItem,
} from '~/lib/utils';

interface OAuthButtonProps {
  providerId: OAuthProviderId;
  className?: React.ComponentProps<typeof Button>['className'];
}

const OAuthButton: React.FC<OAuthButtonProps> = ({ providerId, className }) => {
  const router = useRouter();
  const [lastAuthMethod, setLastAuthMethod] =
    React.useState<AuthOptionsType | null>(null);

  const provider = getProviderById(providerId);

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const lastAuthMethod = getLocalStorageItem('LAST_AUTH_METHOD');
      setLastAuthMethod(lastAuthMethod ?? null);
    }
  }, []);

  if (!provider) {
    return null;
  }

  const oauthMutation = useMutation({
    mutationFn: () => oauthPopup(provider),
    onError(error) {
      toast.error(getErrorMessage(error));
    },
    async onSuccess(result) {
      setLocalStorageItem(
        'LAST_AUTH_METHOD',
        provider.id.toUpperCase() as AuthOptionsType
      );
      // If first-time, home page will open the username modal; push regardless
      router.push('/');
      // Store a hint in sessionStorage to trigger username modal post-redirect
      if (result?.wasCreated) {
        try {
          sessionStorage.setItem('SHOW_USERNAME_MODAL', '1');
        } catch {}
      }
    },
  });

  const renderIcon = () => {
    if (provider.icon) {
      const IconComponent = provider.icon;
      return <IconComponent className="size-5" />;
    }
    return null;
  };

  return (
    <Button
      variant="outline"
      className={`w-full relative ${className}`}
      onClick={async () => {
        await oauthMutation.mutateAsync();
      }}
    >
      {renderIcon()}
      <span className="text-sm">
        {oauthMutation.isPending
          ? 'Signing in…'
          : `Continue with ${provider.name}`}
      </span>
      {oauthMutation.isPending ? (
        <Spinner className="mr-2 bg-background" />
      ) : (
        lastAuthMethod === (provider.id.toUpperCase() as AuthOptionsType) && (
          <i className="text-xs absolute right-4 text-muted-foreground text-center">
            Last used
          </i>
        )
      )}
    </Button>
  );
};

export const OAuthButtons: React.FC<{
  className?: React.ComponentProps<typeof Button>['className'];
}> = ({ className }) => {
  return (
    <div className={`space-y-1 ${className}`}>
      {Object.values(OAUTH_PROVIDERS).map((provider) => (
        <OAuthButton
          key={provider.id}
          providerId={provider.id as OAuthProviderId}
        />
      ))}
    </div>
  );
};

export { OAuthButton };
