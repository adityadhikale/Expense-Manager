CREATE TABLE IF NOT EXISTS "budgets" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"amount" integer NOT NULL,
	"month" timestamp NOT NULL,
	"user_id" text NOT NULL,
	"category_id" text,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "accounts" DROP COLUMN IF EXISTS "plaid_id";--> statement-breakpoint
ALTER TABLE "categories" DROP COLUMN IF EXISTS "plaid_id";--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "budgets" ADD CONSTRAINT "budgets_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
