import { InferSelectModel } from 'drizzle-orm';
import { z } from 'zod/v4';
import { issueInsertSchema, issues, issueUpdateSchema } from '../schemas';
import { organizations, users, users_to_organizations } from '../schemas/users';

export type User = InferSelectModel<typeof users>;
export type Organization = InferSelectModel<typeof organizations>;
export type UserToOrganization = InferSelectModel<
  typeof users_to_organizations
>;
export type Issue = InferSelectModel<typeof issues>;
export type IssueWithOrganization = InferSelectModel<typeof issues> & {
  organization?: Organization;
};

export const authOptionsSchema = z.enum(['EMAIL', 'GOOGLE', 'GITHUB']);

export type AuthOptionsType = z.infer<typeof authOptionsSchema>;

export const userInsertSchema = z.object({
  email: z.email().max(255),
  name: z.string().min(1),
  username: z.string().min(1).optional(),
  image_url: z.string().optional(),
  bio: z.string().optional(),
  auth_provider: authOptionsSchema.optional(),
});

export type UserInsertType = z.infer<typeof userInsertSchema>;

export const signupSchema = z.object({
  email: z.email().max(255),
  name: z.string().min(1).optional(),
  username: z.string().min(1).optional(),
  image_url: z.string().optional(),
  bio: z.string().optional(),
  auth_provider: authOptionsSchema.optional(),
});

export type SignupType = z.infer<typeof signupSchema>;

export const verifyEmailSchema = z.object({
  email: z.email().max(255),
  code: z.string().min(1),
});

export type VerifyEmailType = z.infer<typeof verifyEmailSchema>;

// Reserved usernames that cannot be claimed by users
const RESERVED_USERNAMES = new Set([
  'admin',
  'root',
  'support',
  'help',
  'api',
  'auth',
  'login',
  'logout',
  'signup',
  'user',
  'users',
  'me',
  'settings',
  'about',
  'contact',
  'privacy',
  'terms',
  'status',
  'dashboard',
]);

// Schema for updating the username with strict constraints to prevent XSS and invalid names
export const updateUsernameSchema = z.object({
  username: z
    .string()
    .regex(/^[a-z0-9_]{3,30}$/i, {
      message:
        'Username must be 3-30 characters and contain only letters, numbers, or underscores',
    })
    .refine((value) => !RESERVED_USERNAMES.has(value.toLowerCase()), {
      message: 'This username is reserved',
    }),
});

export type UpdateUsernameType = z.infer<typeof updateUsernameSchema>;

// -------------------- Schema Helpers --------------------

/**
 * Helper to add user_id to any schema
 */
export function withUser<T extends z.ZodObject<any>>(schema: T) {
  return z.object({
    ...schema.shape,
    user_id: z.string().min(1),
  }) as z.ZodObject<
    {
      user_id: z.ZodString;
    } & T['shape']
  >;
}

/**
 * Helper to add organization_id to any schema
 */
export function withOrganization<T extends z.ZodObject<any>>(schema: T) {
  return z.object({
    ...schema.shape,
    organization_id: z.string().min(1),
  }) as z.ZodObject<
    {
      organization_id: z.ZodString;
    } & T['shape']
  >;
}

/**
 * Helper to add both user_id and organization_id to any schema
 */
export function withUserAndOrganization<T extends z.ZodObject<any>>(schema: T) {
  return z.object({
    ...schema.shape,
    user_id: z.string().min(1),
    organization_id: z.string().min(1),
  }) as z.ZodObject<
    {
      user_id: z.ZodString;
      organization_id: z.ZodString;
    } & T['shape']
  >;
}

/**
 * Helper to add optional user_id to any schema
 */
export function withOptionalUser<T extends z.ZodObject<any>>(schema: T) {
  return z.object({
    ...schema.shape,
    user_id: z.string().min(1).optional(),
  }) as z.ZodObject<
    {
      user_id: z.ZodOptional<z.ZodString>;
    } & T['shape']
  >;
}

/**
 * Helper to add optional organization_id to any schema
 */
export function withOptionalOrganization<T extends z.ZodObject<any>>(
  schema: T
) {
  return z.object({
    ...schema.shape,
    organization_id: z.string().min(1).optional(),
  }) as z.ZodObject<
    {
      organization_id: z.ZodOptional<z.ZodString>;
    } & T['shape']
  >;
}

// Type helpers for the schema helpers
export type WithUser<T extends z.ZodObject<any>> = z.infer<
  ReturnType<typeof withUser<T>>
>;

export type WithOrganization<T extends z.ZodObject<any>> = z.infer<
  ReturnType<typeof withOrganization<T>>
>;

export type WithUserAndOrganization<T extends z.ZodObject<any>> = z.infer<
  ReturnType<typeof withUserAndOrganization<T>>
>;

export type WithOptionalUser<T extends z.ZodObject<any>> = z.infer<
  ReturnType<typeof withOptionalUser<T>>
>;

export type WithOptionalOrganization<T extends z.ZodObject<any>> = z.infer<
  ReturnType<typeof withOptionalOrganization<T>>
>;

export { issueInsertSchema, issueUpdateSchema };

export type IssueInsertType = z.infer<typeof issueInsertSchema>;
export type IssueUpdateType = z.infer<typeof issueUpdateSchema>;

// Schema used by external clients (e.g. frontend) where `user_id` is injected
// server-side from the authenticated token. Keeps a single source of truth for
// validation & types across FE ↔️ BE.
export const issueCreateSchema = issueInsertSchema.omit({ user_id: true });
export type IssueCreateType = z.infer<typeof issueCreateSchema>;
