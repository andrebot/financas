ALTER TABLE "goals" ADD COLUMN "savedValue" numeric(14, 2) DEFAULT '0' NOT NULL;--> statement-breakpoint
ALTER TABLE "monthlyBalances" ADD COLUMN "transactionsJson" jsonb DEFAULT '[]'::jsonb NOT NULL;