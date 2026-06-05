ALTER TABLE "cards" DROP CONSTRAINT "cards_accountId_accounts_id_fk";
--> statement-breakpoint
ALTER TABLE "budgetUsage" DROP CONSTRAINT "budgetUsage_transactionId_transactions_id_fk";
--> statement-breakpoint
ALTER TABLE "monthlyBalances" DROP CONSTRAINT "monthlyBalances_accountId_accounts_id_fk";
--> statement-breakpoint
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_accountId_accounts_id_fk";
--> statement-breakpoint
ALTER TABLE "transactionToGoals" DROP CONSTRAINT "transactionToGoals_transactionId_transactions_id_fk";
--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_accountId_accounts_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budgetUsage" ADD CONSTRAINT "budgetUsage_transactionId_transactions_id_fk" FOREIGN KEY ("transactionId") REFERENCES "public"."transactions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monthlyBalances" ADD CONSTRAINT "monthlyBalances_accountId_accounts_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_accountId_accounts_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."accounts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactionToGoals" ADD CONSTRAINT "transactionToGoals_transactionId_transactions_id_fk" FOREIGN KEY ("transactionId") REFERENCES "public"."transactions"("id") ON DELETE cascade ON UPDATE no action;