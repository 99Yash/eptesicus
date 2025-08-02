import { and, db, eq } from '@workspace/db';
import {
  issueInsertSchema,
  IssueUpdateType,
  WithUser,
} from '@workspace/db/helpers';
import { issues, users_to_organizations } from '@workspace/db/schemas';
import { AppError } from '../lib/error';

class IssueService {
  /*
   * Create a new issue. `user_id` is picked from the authenticated request layer.
   */
  async createIssue(args: WithUser<typeof issueInsertSchema>) {
    const {
      title,
      description,
      organization_id,
      assignee_id,
      todo_status,
      todo_priority,
      user_id,
    } = args;

    console.log('[IssueService] Creating issue with payload:', args);

    // -------------------- Validation --------------------
    // 1. Verify that the user actually belongs to the provided organization_id
    const membership = await db.query.users_to_organizations.findFirst({
      where: and(
        eq(users_to_organizations.user_id, user_id),
        eq(users_to_organizations.organization_id, organization_id as string)
      ),
    });

    if (!membership) {
      throw new AppError({
        code: 'FORBIDDEN',
        message: 'You are not a member of the specified organization',
      });
    }

    // -------------------- Insert --------------------
    const [issue] = await db
      .insert(issues)
      .values({
        title,
        description,
        organization_id,
        assignee_id,
        todo_status,
        todo_priority,
        user_id,
      })
      .returning();

    if (!issue) {
      throw new AppError({
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to create issue',
      });
    }

    // Fetch the issue with organization data
    const issueWithOrg = await db.query.issues.findFirst({
      where: eq(issues.id, issue.id),
      with: {
        organization: true,
      },
    });

    return issueWithOrg || issue;
  }

  /*
   * Fetch a single issue by id
   */
  async getIssue(id: string) {
    const issue = await db.query.issues.findFirst({
      where: eq(issues.id, id),
      with: {
        organization: true,
      },
    });

    if (!issue) {
      throw new AppError({
        code: 'NOT_FOUND',
        message: 'Issue not found',
      });
    }

    return issue;
  }

  /*
   * List issues. Optionally filter by organization_id or user_id
   */
  async listIssues(filter?: { organization_id?: string; user_id?: string }) {
    const whereClauses = [] as Array<ReturnType<typeof eq>>;

    if (filter?.organization_id) {
      whereClauses.push(eq(issues.organization_id, filter.organization_id));
    }

    if (filter?.user_id) {
      whereClauses.push(eq(issues.user_id, filter.user_id));
    }

    const whereExpr =
      whereClauses.length === 0
        ? undefined
        : whereClauses.length === 1
          ? whereClauses[0]
          : and(...whereClauses);

    const result = await db.query.issues.findMany({
      where: whereExpr,
      orderBy: (issues, { desc }) => desc(issues.createdAt),
      with: {
        organization: true,
      },
    });

    return result;
  }

  /*
   * Update an existing issue by id
   */
  async updateIssue(id: string, data: IssueUpdateType) {
    // Remove undefined fields so drizzle doesn't try to set them as NULL
    const updatePayload: Record<string, unknown> = Object.fromEntries(
      Object.entries(data).filter(([, v]) => v !== undefined)
    );

    if (Object.keys(updatePayload).length === 0) {
      throw new AppError({
        code: 'BAD_REQUEST',
        message: 'No fields to update',
      });
    }

    const [issue] = await db
      .update(issues)
      .set(updatePayload)
      .where(eq(issues.id, id))
      .returning();

    if (!issue) {
      throw new AppError({
        code: 'NOT_FOUND',
        message: 'Issue not found',
      });
    }

    // Fetch the issue with organization data
    const issueWithOrg = await db.query.issues.findFirst({
      where: eq(issues.id, id),
      with: {
        organization: true,
      },
    });

    return issueWithOrg || issue;
  }

  /*
   * Delete an issue
   */
  async deleteIssue(id: string) {
    const [issue] = await db
      .delete(issues)
      .where(eq(issues.id, id))
      .returning();

    if (!issue) {
      throw new AppError({
        code: 'NOT_FOUND',
        message: 'Issue not found',
      });
    }

    return issue;
  }
}

export const issueService = new IssueService();
