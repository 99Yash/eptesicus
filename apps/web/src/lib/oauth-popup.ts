import { env } from '~/env';
import { OAuthProvider } from './oauth-providers';

export async function oauthPopup(provider: OAuthProvider): Promise<void> {
  if (typeof window === 'undefined') {
    throw new Error(
      'Window is undefined. This function must run in a browser context.'
    );
  }

  return new Promise((resolve, reject) => {
    // Use provider-specific dimensions or defaults
    const { width = 500, height = 600 } = provider.popupDimensions || {};
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
      // Ensure the message is coming from our API origin
      if (!event.origin.startsWith(env.NEXT_PUBLIC_API_URL)) {
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
