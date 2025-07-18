import { InferSelectModel } from 'drizzle-orm';
import { z } from 'zod';
import { organizations, users, users_to_organizations } from '../schemas/users';

export type User = InferSelectModel<typeof users>;
export type Organization = InferSelectModel<typeof organizations>;
export type UserToOrganization = InferSelectModel<
  typeof users_to_organizations
>;

export const userInsertSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().min(1),
  username: z.string().min(1),
  image_url: z.string().optional(),
  bio: z.string().optional(),
});

export type UserInsertType = z.infer<typeof userInsertSchema>;
