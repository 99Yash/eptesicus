import { EncryptJWT, jwtDecrypt } from 'jose';

import { env } from '../env';

const secret = Buffer.from(env.JWT_SECRET, 'base64');

if (secret.length !== 32) {
  throw new Error('Invalid key length: must be 32 bytes');
}

interface JWTTokenPayload {
  userId: string;
}

interface SignTokenPayload {
  userId: JWTTokenPayload['userId'];
}

type VerifyTokenResult =
  | ({ is_expired: false } & SignTokenPayload)
  | { is_expired: true };

export async function generateEncryptedToken(payload: SignTokenPayload) {
  const { userId } = payload;

  const token = await new EncryptJWT({
    userId,
  } satisfies JWTTokenPayload)
    .setExpirationTime('1d')
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
    return { is_expired: false, userId: payload.userId };
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
