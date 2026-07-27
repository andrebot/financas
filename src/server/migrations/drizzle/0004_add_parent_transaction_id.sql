ALTER TABLE "transactions" ADD COLUMN "parentTransactionId" integer;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_parentTransactionId_transactions_id_fk" FOREIGN KEY ("parentTransactionId") REFERENCES "public"."transactions"("id") ON DELETE cascade ON UPDATE no action;
