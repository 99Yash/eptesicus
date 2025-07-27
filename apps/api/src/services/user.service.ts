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

    let finalUsername: string;

    if (existingUser) {
      // For existing users, keep their current username
      finalUsername = existingUser.username;
    } else {
      // For new users, handle username generation/validation
      if (username && username.trim().length > 0) {
        // User provided a username, check if it's available
        console.log(
          '[UserService] Checking provided username uniqueness:',
          username
        );
        const existingUsernameUser = await db.query.users.findFirst({
          where: eq(users.username, username.trim()),
        });

        if (existingUsernameUser) {
          console.log(
            '[UserService] Provided username already exists:',
            username,
            'for user:',
            existingUsernameUser.email
          );
          throw new AppError({
            code: 'BAD_REQUEST',
            message: 'Username already taken',
          });
        }
        finalUsername = username.trim();
      } else {
        // Generate unique username using AI service
        console.log(
          '[UserService] Generating unique username for:',
          name || email
        );
        finalUsername = await generateUniqueUsername(name || email);

        // Double-check the generated username is still available (race condition protection)
        const existingUsernameUser = await db.query.users.findFirst({
          where: eq(users.username, finalUsername),
        });

        if (existingUsernameUser) {
          console.log(
            '[UserService] Generated username became unavailable:',
            finalUsername,
            'for user:',
            existingUsernameUser.email
          );
          throw new AppError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'Failed to generate unique username. Please try again.',
          });
        }
      }
    }

    const userToInsert = {
      email,
      name: finalName,
      username: finalUsername,
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

  async checkUsernameAvailability(username: string) {
    if (!username || username.trim().length === 0) {
      return { available: false, message: 'Username cannot be empty' };
    }

    const trimmedUsername = username.trim();

    // Basic validation
    if (trimmedUsername.length < 3) {
      return {
        available: false,
        message: 'Username must be at least 3 characters long',
      };
    }

    if (trimmedUsername.length > 50) {
      return {
        available: false,
        message: 'Username must be less than 50 characters',
      };
    }

    // Check for invalid characters
    if (!/^[a-z0-9_-]+$/.test(trimmedUsername)) {
      return {
        available: false,
        message:
          'Username can only contain lowercase letters, numbers, underscores, and hyphens',
      };
    }

    // Check if username is reserved
    const reservedUsernames = [
      'settings',
      'signout',
      'messages',
      'notifications',
      'profile',
      'home',
      'search',
      'explore',
      'admin',
      'root',
      'system',
    ];
    if (reservedUsernames.includes(trimmedUsername.toLowerCase())) {
      return { available: false, message: 'This username is reserved' };
    }

    // Check database for existing username
    const existingUser = await db.query.users.findFirst({
      where: eq(users.username, trimmedUsername),
    });

    if (existingUser) {
      return { available: false, message: 'Username already taken' };
    }

    return { available: true, message: 'Username is available' };
  }
}

export const userService = new UserService();
