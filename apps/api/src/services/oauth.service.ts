import { and, db, eq } from '@workspace/db';
import { federated_credentials, users } from '@workspace/db/schemas';
import { AppError } from '../lib/error';

interface GoogleProfile {
  id: string;
  displayName: string;
  emails: Array<{ value: string; verified: boolean }>;
  photos?: Array<{ value: string }>;
}

class OAuthService {
  async findOrCreateUser(profile: GoogleProfile) {
    const { id: googleId, displayName, emails } = profile;

    if (!emails || emails.length === 0) {
      throw new AppError({
        code: 'BAD_REQUEST',
        message: 'No email found in Google profile',
      });
    }

    const email = emails[0]?.value;
    const isEmailVerified = emails[0]?.verified;

    if (!email) {
      throw new AppError({
        code: 'BAD_REQUEST',
        message: 'No email found in Google profile',
      });
    }

    if (!isEmailVerified) {
      throw new AppError({
        code: 'BAD_REQUEST',
        message: 'Email not verified with Google',
      });
    }

    // First, try to find existing federated credential
    const existingCredential = await db.query.federated_credentials.findFirst({
      where: and(
        eq(federated_credentials.provider, 'google'),
        eq(federated_credentials.subject, googleId)
      ),
    });

    if (existingCredential) {
      // User exists, return the user
      const user = await db.query.users.findFirst({
        where: eq(users.id, existingCredential.user_id),
      });

      if (!user) {
        throw new AppError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'User not found for existing credential',
        });
      }

      return user;
    }

    // Check if user exists with this email (from previous email-based signup)
    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      // User exists but doesn't have Google OAuth credential
      // Create the federated credential for this user
      await db.insert(federated_credentials).values({
        user_id: existingUser.id,
        provider: 'google',
        subject: googleId,
      });

      return existingUser;
    }

    // Create new user and federated credential
    const [newUser] = await db
      .insert(users)
      .values({
        email,
        name: displayName,
        username: await this.generateUniqueUsername(displayName),
        image_url: profile.photos?.[0]?.value,
      })
      .returning();

    if (!newUser) {
      throw new AppError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create user',
      });
    }

    // Create federated credential
    await db.insert(federated_credentials).values({
      user_id: newUser.id,
      provider: 'google',
      subject: googleId,
    });

    return newUser;
  }

  private async generateUniqueUsername(displayName: string): Promise<string> {
    const baseUsername = displayName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 20);

    let username = baseUsername;
    let counter = 1;

    while (true) {
      const existingUser = await db.query.users.findFirst({
        where: eq(users.username, username),
      });

      if (!existingUser) {
        break;
      }

      username = `${baseUsername}${counter}`;
      counter++;
    }

    return username;
  }
}

export const oauthService = new OAuthService();
