CREATE TYPE "public"."issue_priorities" AS ENUM('no_priority', 'urgent', 'high', 'medium', 'low');--> statement-breakpoint
CREATE TYPE "public"."issue_statuses" AS ENUM('backlog', 'todo', 'in_progress', 'in_review', 'done', 'cancelled', 'duplicate');--> statement-breakpoint
CREATE TABLE "issues" (
	"id" varchar PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"user_id" varchar NOT NULL,
	"organization_id" varchar NOT NULL,
	"assignee_id" varchar,
	"todo_status" "issue_statuses",
	"todo_priority" "issue_priorities",
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT current_timestamp
);
--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_organization_id_organizations_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organizations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "issues" ADD CONSTRAINT "issues_assignee_id_users_id_fk" FOREIGN KEY ("assignee_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;