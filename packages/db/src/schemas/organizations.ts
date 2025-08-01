import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod/v4';
import { organizations } from './users';

// Zod schema for inserting a new organization row
export const organizationInsertSchema = createInsertSchema(organizations, {
  name: (schema) => schema.max(255),
});

export type OrganizationInsertType = z.infer<typeof organizationInsertSchema>;
