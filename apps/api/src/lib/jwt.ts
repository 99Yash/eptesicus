import { EncryptJWT, jwtDecrypt } from 'jose';

import { env } from '../env';

const secret = Buffer.from(env.JWT_SECRET, 'base64');

if (secret.length !== 32) {
  throw new Error('Invalid key length: must be 32 bytes');
}

interface JWTTokenPayload {
  user_id: string;
}

interface SignTokenPayload {
  user_id: JWTTokenPayload['user_id'];
}

type VerifyTokenResult =
  | ({ is_expired: false } & SignTokenPayload)
  | { is_expired: true };

export async function generateEncryptedToken(payload: SignTokenPayload) {
  const { user_id } = payload;

  const token = await new EncryptJWT({
    user_id,
  } satisfies JWTTokenPayload)
    .setExpirationTime('1h')
    .setProtectedHeader({ alg: 'dir', enc: 'A128CBC-HS256' })
    .encrypt(secret);

  return {
    token,
  };
}

/*
 * @description Verify the token, and return the payload which is the user's id
 * @param token - The token to verify
 * @returns `{ is_expired: false, uid: string }` if the token is valid, `{ is_expired: true }` if the token is expired
 */
export async function verifyToken(token: string): Promise<VerifyTokenResult> {
  try {
    const payload = (await jwtDecrypt(token, secret))
      .payload as unknown as JWTTokenPayload;
    return { is_expired: false, user_id: payload.user_id };
  } catch (err) {
    if (
      !!err &&
      typeof err === 'object' &&
      'code' in err &&
      err.code === 'ERR_JWT_EXPIRED'
    ) {
      return { is_expired: true };
    }
    throw err;
  }
}
