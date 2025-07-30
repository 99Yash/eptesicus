import { GitHub, Google } from '@workspace/ui/icons';
import { env } from '~/env';

export interface OAuthProvider {
  id: string;
  name: string;
  authUrl: string;
  icon?: React.ComponentType<{ className?: string }>;
  enabled: boolean;
  popupDimensions?: {
    width: number;
    height: number;
  };
}

export const OAUTH_PROVIDERS: Record<string, OAuthProvider> = {
  google: {
    id: 'google',
    name: 'Google',
    authUrl: `${env.NEXT_PUBLIC_API_URL}/auth/google`,
    icon: Google,
    enabled: true,
    popupDimensions: {
      width: 500,
      height: 600,
    },
  },
  github: {
    id: 'github',
    name: 'GitHub',
    authUrl: `${env.NEXT_PUBLIC_API_URL}/auth/github`,
    icon: GitHub,
    enabled: true,
    popupDimensions: {
      width: 500,
      height: 600,
    },
  },
} as const;

export type OAuthProviderId = keyof typeof OAUTH_PROVIDERS;

export const getEnabledProviders = (): OAuthProvider[] => {
  return Object.values(OAUTH_PROVIDERS).filter((provider) => provider.enabled);
};

export const getProviderById = (
  id: OAuthProviderId
): OAuthProvider | undefined => {
  return OAUTH_PROVIDERS[id];
};

export const isProviderEnabled = (id: OAuthProviderId): boolean => {
  return OAUTH_PROVIDERS[id]?.enabled ?? false;
};
