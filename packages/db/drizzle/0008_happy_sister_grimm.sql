ALTER TABLE "issues" DROP CONSTRAINT "issues_organization_id_organizations_id_fk";
--> statement-breakpoint
ALTER TABLE "issues" ALTER COLUMN "organization_id" DROP NOT NULL;