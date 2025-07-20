import { EncryptJWT, jwtDecrypt } from 'jose';

import { env } from '../env';

const secret = Buffer.from(env.JWT_SECRET, 'base64'); // ✅ 32 bytes

if (secret.length !== 32) {
  throw new Error('Invalid key length: must be 32 bytes');
}

interface JWTTokenPayload {
  uid: string;
}

interface SignTokenPayload {
  uid: JWTTokenPayload['uid'];
}

type VerifyTokenResult =
  | ({ is_expired: false } & SignTokenPayload)
  | { is_expired: true };

export async function generateEncryptedToken(payload: SignTokenPayload) {
  const { uid } = payload;

  const token = await new EncryptJWT({
    uid,
  } satisfies JWTTokenPayload)
    .setExpirationTime('1h')
    .setProtectedHeader({ alg: 'dir', enc: 'A128CBC-HS256' })
    .encrypt(secret);

  return {
    token,
  };
}

export async function verifyToken(token: string): Promise<VerifyTokenResult> {
  try {
    const payload = (await jwtDecrypt(token, secret))
      .payload as unknown as JWTTokenPayload;
    return { is_expired: false, uid: payload.uid };
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
