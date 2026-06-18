ALTER TABLE "cards" ADD COLUMN "closingDay" integer NOT NULL DEFAULT 1;--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "cardId" integer;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_cardId_cards_id_fk" FOREIGN KEY ("cardId") REFERENCES "public"."cards"("id") ON DELETE set null ON UPDATE no action;
