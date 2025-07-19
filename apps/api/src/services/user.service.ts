import { db, eq } from '@workspace/db';
import { UserInsertType } from '@workspace/db/helpers';
import { users } from '@workspace/db/schemas';
import { AppError } from '../lib/error';

class UserService {
  async upsertUser(args: UserInsertType) {
    const { email, name, username, bio, image_url } = args;

    const existingUser = await db.query.users.findFirst({
      where: eq(users.email, email),
    });

    if (existingUser) {
      return existingUser;
    }

    const [user] = await db
      .insert(users)
      .values({
        email,
        name,
        username,
        bio,
        image_url,
      })
      .returning();

    if (!user) {
      throw new AppError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create user',
      });
    }

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
