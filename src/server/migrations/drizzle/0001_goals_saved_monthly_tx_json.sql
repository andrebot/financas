ALTER TABLE "goals" ADD COLUMN IF NOT EXISTS "savedValue" numeric(14, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "monthlyBalances" ADD COLUMN IF NOT EXISTS "transactionsJson" jsonb DEFAULT '[]'::jsonb NOT NULL;--> statement-breakpoint
