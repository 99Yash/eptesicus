import { db } from '@workspace/db';
import { UserInsertType, UserSelectType, users } from '@workspace/db/schemas';
import { AppError } from '../lib/error';

class UserService {
  async createUser(
    user: Omit<UserInsertType, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<UserSelectType> {
    const { email, name, username, bio, image_url } = user;

    const [newUser] = await db
      .insert(users)
      .values({
        email,
        name,
        username,
        bio,
        image_url,
      })
      .returning();

    if (!newUser) {
      throw new AppError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create user',
      });
    }

    return newUser;
  }
}

export default new UserService();
