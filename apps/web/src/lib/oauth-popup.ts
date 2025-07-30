import { env } from '~/env';
import { OAUTH_POPUP_DIMENSIONS, OAuthProvider } from './oauth-providers';

/**
 * Validates that an origin exactly matches the expected API URL
 * This prevents subdomain attacks and ensures proper security
 */
function validateOrigin(origin: string, expectedApiUrl: string): boolean {
  try {
    // Parse both URLs to extract their origins
    const originUrl = new URL(origin);
    const expectedUrl = new URL(expectedApiUrl);

    // Compare the complete origin (protocol + hostname + port)
    return originUrl.origin === expectedUrl.origin;
  } catch (error) {
    // If URL parsing fails, the origin is invalid
    console.warn('[oauth-popup] Invalid origin format:', origin);
    return false;
  }
}

export async function oauthPopup(provider: OAuthProvider): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error(
      'Window is undefined. This function must run in a browser context.'
    );
  }

  return new Promise((resolve, reject) => {
    // Use fixed popup dimensions
    const { width, height } = OAUTH_POPUP_DIMENSIONS;
    const top = window.screenY + (window.outerHeight - height) / 2;
    const left = window.screenX + (window.outerWidth - width) / 2;

    const popup = window.open(
      provider.authUrl,
      `${provider.id}-oauth`,
      `width=${width},height=${height},left=${left},top=${top}`
    );

    if (!popup) {
      reject(new Error('Failed to open popup'));
      return;
    }

    // Reject if the user closes the popup manually
    const popupCheck = setInterval(() => {
      if (popup.closed) {
        clearInterval(popupCheck);
        reject(new Error('Popup closed by user'));
      }
    }, 500);

    function handleMessage(event: MessageEvent) {
      // Secure origin validation - exact match to prevent subdomain attacks
      if (!validateOrigin(event.origin, env.NEXT_PUBLIC_API_URL)) {
        console.warn(
          '[oauth-popup] Rejected message from unauthorized origin:',
          event.origin
        );
        return;
      }

      const { type, error, message } = event.data || {};
      if (type !== `${provider.id}-oauth`) return;

      window.removeEventListener('message', handleMessage);
      clearInterval(popupCheck);
      popup?.close();

      if (error) {
        reject(new Error(message || 'Authentication failed'));
      } else {
        resolve();
      }
    }

    window.addEventListener('message', handleMessage);
  });
}
