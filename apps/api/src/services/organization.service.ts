import { db, eq } from '@workspace/db';
import {
  OrganizationInsertType,
  organizations,
  users_to_organizations,
} from '@workspace/db/schemas';
import { AppError } from '../lib/error';

class OrganizationService {
  /*
   * Create a new organization and link it with the given user.
   */
  async createOrganization(data: OrganizationInsertType & { user_id: string }) {
    const { name, logo_url, bio, user_id } = data;

    // Basic duplicate name check within DB (optional but nice to have)
    const existing = await db.query.organizations.findFirst({
      where: eq(organizations.name, name),
    });

    if (existing) {
      throw new AppError({
        code: 'CONFLICT',
        message: 'Organization with this name already exists',
      });
    }

    const [org] = await db
      .insert(organizations)
      .values({ name, logo_url, bio })
      .returning();

    if (!org) {
      throw new AppError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create organization',
      });
    }

    // Link user to organization (as creator/owner)
    await db.insert(users_to_organizations).values({
      user_id,
      organization_id: org.id,
    });

    return org;
  }

  /*
   * List organizations for a given user.
   */
  async listOrganizations(user_id: string) {
    const rows = await db.query.users_to_organizations.findMany({
      where: eq(users_to_organizations.user_id, user_id),
      with: {
        organization: true,
      },
    });

    // Map to organization entities (drizzle returns relations based on config)
    return rows.map((row) => row.organization);
  }
}

export const organizationService = new OrganizationService();
