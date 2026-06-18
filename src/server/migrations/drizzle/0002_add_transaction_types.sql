ALTER TABLE "transactions" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."transactionTypes";--> statement-breakpoint
CREATE TYPE "public"."transactionTypes" AS ENUM('withdraw', 'transferIn', 'transferOut', 'deposit', 'bankSlip', 'cardPurchase', 'cardRefund', 'investmentBuy', 'investmentSell', 'investmentDividend', 'investmentInterest', 'investmentDueDate', 'pixIn', 'pixOut');--> statement-breakpoint
ALTER TABLE "transactions" ALTER COLUMN "type" SET DATA TYPE "public"."transactionTypes" USING "type"::"public"."transactionTypes";