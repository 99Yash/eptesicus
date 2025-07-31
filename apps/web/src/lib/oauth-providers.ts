import { AuthOptionsType } from '@workspace/db/helpers';
import { GitHub, Google } from '@workspace/ui/icons';
import { env } from '~/env';

export interface OAuthProvider {
  id: string;
  name: string;
  authUrl: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export const OAUTH_POPUP_DIMENSIONS = {
  width: 500,
  height: 600,
} as const;

export const OAUTH_PROVIDERS: Record<
  Lowercase<Exclude<AuthOptionsType, 'EMAIL'>>,
  OAuthProvider
> = {
  github: {
    id: 'github',
    name: 'GitHub',
    authUrl: `${env.NEXT_PUBLIC_API_URL}/auth/github`,
    icon: GitHub,
  },
  google: {
    id: 'google',
    name: 'Google',
    authUrl: `${env.NEXT_PUBLIC_API_URL}/auth/google`,
    icon: Google,
  },
} as const;

export type OAuthProviderId = keyof typeof OAUTH_PROVIDERS;

export const getProviderById = (
  id: OAuthProviderId
): OAuthProvider | undefined => {
  return OAUTH_PROVIDERS[id];
};
