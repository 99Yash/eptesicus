import { and, db, eq } from '@workspace/db';
import { UserInsertType, VerifyEmailType } from '@workspace/db/helpers';
import { email_verification_codes, users } from '@workspace/db/schemas';
import { sendEmail } from '../lib/email';
import { AppError } from '../lib/error';
import { generateUniqueUsername } from './ai.service';

class UserService {
  async upsertUser(args: UserInsertType) {
    const { email, name, username } = args;

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return existingUser;
    }

    const finalName =
      name && name.trim().length > 0 ? name : email.split('@')[0] || 'User';

    const randomUsername = username
      ? username
      : await generateUniqueUsername(name || email);

    const userToInsert = {
      email,
      name: finalName,
      username: randomUsername,
    };
    console.log('[UserService] Inserting user:', userToInsert);

    const [user] = await db.insert(users).values(userToInsert).returning();

    if (!user) {
      throw new AppError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create user',
      });
    }

    // TODO: create email verification code (only if auth is using email verification?)
    //  Send a generic toast message to the user that a verification code has been sent to their email, like "Please check your inbox for further instructions"
    const [verification_code] = await db
      .insert(email_verification_codes)
      .values({
        email,
        user_id: user.id,
        expires_at: new Date(Date.now() + 60 * 60 * 1000),
      })
      .returning();

    if (!verification_code) {
      throw new AppError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create email verification code',
      });
    }

    //TODO: create a separate emails package for writing emails
    await sendEmail({
      to: [email],
      subject: `Welcome to Eptesicus, ${name}!`,
      html: `
        <h1>Welcome to Eptesicus, ${name}!</h1>
        <p>Your verification code is: ${verification_code.code}</p>
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

    const verification_code = await db.query.email_verification_codes.findFirst(
      {
        where: and(
          eq(email_verification_codes.email, email),
          eq(email_verification_codes.code, Number(code))
        ),
      }
    );

    if (!verification_code) {
      throw new AppError({
        code: 'NOT_FOUND',
        message: 'Invalid verification code',
      });
    }

    if (verification_code.expires_at < new Date()) {
      throw new AppError({
        code: 'BAD_REQUEST',
        message: 'Verification code expired',
      });
    }
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
