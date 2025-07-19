import { db } from '@workspace/db';
import { UserInsertType } from '@workspace/db/helpers';
import { users } from '@workspace/db/schemas';
import { AppError } from '../lib/error';

class UserService {
  async createUser(args: UserInsertType) {
    const { email, name, username, bio, image_url } = args;

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
}

export default new UserService();
