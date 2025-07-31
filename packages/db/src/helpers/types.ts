import { InferSelectModel } from 'drizzle-orm';
import { z } from 'zod';
import { issues } from '../schemas';
import { organizations, users, users_to_organizations } from '../schemas/users';

export type User = InferSelectModel<typeof users>;
export type Organization = InferSelectModel<typeof organizations>;
export type UserToOrganization = InferSelectModel<
  typeof users_to_organizations
>;
export type Issue = InferSelectModel<typeof issues>;

export const authOptionsSchema = z.enum(['EMAIL', 'GOOGLE', 'GITHUB']);

export type AuthOptionsType = z.infer<typeof authOptionsSchema>;

export const userInsertSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().min(1),
  username: z.string().min(1).optional(),
  image_url: z.string().optional(),
  bio: z.string().optional(),
  auth_provider: authOptionsSchema.optional(),
});

export type UserInsertType = z.infer<typeof userInsertSchema>;

export const signupSchema = z.object({
  email: z.string().email().max(255),
  name: z.string().min(1).optional(),
  username: z.string().min(1).optional(),
  image_url: z.string().optional(),
  bio: z.string().optional(),
  auth_provider: authOptionsSchema.optional(),
});

export type SignupType = z.infer<typeof signupSchema>;

export const verifyEmailSchema = z.object({
  email: z.string().email().max(255),
  code: z.string().min(1),
});

export type VerifyEmailType = z.infer<typeof verifyEmailSchema>;
