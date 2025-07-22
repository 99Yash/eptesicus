import { db, eq } from '@workspace/db';
import { email_verification_codes, users } from '@workspace/db/schemas';
import { AppError } from '../lib/error';

class UserService {
  async upsertUser(args: { email: string; name?: string; username?: string }) {
    const { email, name, username } = args;

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return existingUser;
    }

    // Generate name from email or default to 'User'
    const finalName =
      name && name.trim().length > 0 ? name : email.split('@')[0] || 'User';
    // Generate random username
    const randomUsername =
      username && username.trim().length > 0
        ? username
        : 'user_' + Math.random().toString(36).slice(2, 10);

    const userToInsert = {
      email,
      name: finalName,
      username: randomUsername,
    };
    console.log('[UserService] Inserting user:', userToInsert);

    // TODO: send email verification code
    // If user doesn't exist, create user, create email verification code

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

    // TODO: email verification code to the user's email

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
}

export const userService = new UserService();
