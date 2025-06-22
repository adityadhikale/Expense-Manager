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
DO $$ BEGIN
 ALTER TABLE "budgets" ADD CONSTRAINT "budgets_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX "idx_budgets_user_month" ON "budgets" ("user_id", "month");
--> statement-breakpoint
CREATE INDEX "idx_budgets_category" ON "budgets" ("category_id");

