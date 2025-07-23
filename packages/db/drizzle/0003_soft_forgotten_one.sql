CREATE TABLE "federated_credentials" (
	"id" varchar PRIMARY KEY NOT NULL,
	"user_id" varchar NOT NULL,
	"provider" varchar(50) NOT NULL,
	"subject" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT current_timestamp
);
--> statement-breakpoint
ALTER TABLE "federated_credentials" ADD CONSTRAINT "federated_credentials_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "federated_credentials_user_id_idx" ON "federated_credentials" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "federated_credentials_provider_subject_idx" ON "federated_credentials" USING btree ("provider","subject");