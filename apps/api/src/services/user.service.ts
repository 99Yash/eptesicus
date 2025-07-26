import { and, db, eq } from '@workspace/db';
import { UserInsertType, VerifyEmailType } from '@workspace/db/helpers';
import {
  email_verification_codes,
  EmailVerificationCode,
  users,
} from '@workspace/db/schemas';
import { sendEmail } from '../lib/email';
import { AppError } from '../lib/error';
import { generateUniqueUsername } from './ai.service';

class UserService {
  async upsertUser(args: UserInsertType) {
    const { email, name, username } = args;

    //TODO: send verification code on every signup only if 2FA is enabled

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    const finalName =
      existingUser?.name ||
      (name && name.trim().length > 0 ? name : email.split('@')[0] || 'User');

    const randomUsername =
      existingUser?.username ||
      (username && username.trim().length > 0
        ? username
        : await generateUniqueUsername(name || email));

    const userToInsert = {
      email,
      name: finalName,
      username: randomUsername,
    };
    console.log('[UserService] Inserting user:', userToInsert);

    const [user] = existingUser
      ? [existingUser]
      : await db.insert(users).values(userToInsert).returning();

    if (!user) {
      throw new AppError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create user',
      });
    }

    // Check if there's an existing verification code and if it's expired
    const existing_code = await db.query.email_verification_codes.findFirst({
      where: eq(email_verification_codes.email, email),
    });

    let verification_code: EmailVerificationCode | null = null;

    if (existing_code && existing_code.expires_at > new Date()) {
      // Use existing valid code
      console.log(
        '[UserService] Using existing valid verification code for:',
        email
      );
      verification_code = existing_code;
    } else {
      // Create new verification code (either user doesn't exist or code is expired)
      if (existing_code) {
        console.log(
          '[UserService] Deleting expired verification code for:',
          email
        );
        // Delete expired code
        await db
          .delete(email_verification_codes)
          .where(eq(email_verification_codes.email, email));
      }

      console.log('[UserService] Creating new verification code for:', email);
      // Create new verification code
      const [newCode] = await db
        .insert(email_verification_codes)
        .values({
          email,
          user_id: user.id,
          expires_at: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        })
        .returning();

      if (!newCode) {
        throw new AppError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to create email verification code',
        });
      }

      verification_code = newCode;
    }

    if (!verification_code) {
      throw new AppError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create email verification code',
      });
    }

    //TODO: create a separate emails package for writing emails, put rate limiting here, and send emails in a queue
    await sendEmail({
      to: [email],
      subject: `Welcome to Eptesicus!`,
      // If verification code starts with 0, it will be displayed as a string
      html: `
        <p>Your verification code is: <b>${String(verification_code.code)}</b></p> 
      `,
    });

    return user;
  }

  async getUser(id: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!user) {
      throw new AppError({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
    }

    return user;
  }

  async verifyEmail(args: VerifyEmailType) {
    const { email, code } = args;
    console.log('[UserService] Verifying email:', email, 'with code:', code);

    const verification_code = await db.query.email_verification_codes.findFirst(
      {
        where: and(
          eq(email_verification_codes.email, email),
          eq(email_verification_codes.code, Number(code))
        ),
      }
    );

    if (!verification_code) {
      console.log('[UserService] Invalid verification code for:', email);
      throw new AppError({
        code: 'NOT_FOUND',
        message: 'Invalid verification code',
      });
    }

    if (verification_code.expires_at < new Date()) {
      console.log('[UserService] Expired verification code for:', email);
      throw new AppError({
        code: 'BAD_REQUEST',
        message: 'Verification code expired',
      });
    }

    console.log('[UserService] Verification successful for:', email);
    // Delete the verification code after successful verification
    await db
      .delete(email_verification_codes)
      .where(eq(email_verification_codes.email, email));

    // Return the user for token generation
    return await this.getUserByEmail(email);
  }

  async getUserByEmail(email: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (!user) {
      throw new AppError({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
    }

    return user;
  }

  async getUserById(id: string) {
    const user = await db.query.users.findFirst({
      where: eq(users.id, id),
    });

    if (!user) {
      throw new AppError({
        code: 'NOT_FOUND',
        message: 'User not found',
      });
    }

    return user;
  }
}

export const userService = new UserService();
