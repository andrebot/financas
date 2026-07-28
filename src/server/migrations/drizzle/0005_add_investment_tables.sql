CREATE TYPE "public"."rateTypes" AS ENUM('pre', 'cdi', 'ipca', 'igpm', 'selic', 'other');--> statement-breakpoint
CREATE TABLE "investments" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"investmentType" "investmentTypes" NOT NULL,
	"ticker" text,
	"accountId" integer NOT NULL,
	"userId" integer NOT NULL,
	"quantity" numeric(14, 8),
	"averagePrice" numeric(14, 2),
	"totalInvested" numeric(14, 2) DEFAULT '0' NOT NULL,
	"dueDate" timestamp,
	"rateType" "rateTypes",
	"rateValue" numeric(8, 4),
	"issuer" text,
	"archived" boolean DEFAULT false NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "transactionToInvestments" (
	"transactionId" integer NOT NULL,
	"investmentId" integer NOT NULL,
	"quantity" numeric(14, 8),
	"unitPrice" numeric(14, 2),
	CONSTRAINT "transactionToInvestments_transactionId_investmentId_pk" PRIMARY KEY("transactionId","investmentId")
);
--> statement-breakpoint
CREATE TABLE "investmentToGoals" (
	"investmentId" integer NOT NULL,
	"goalId" integer NOT NULL,
	"percentage" numeric(14, 2) NOT NULL,
	CONSTRAINT "investmentToGoals_investmentId_goalId_pk" PRIMARY KEY("investmentId","goalId")
);
--> statement-breakpoint
ALTER TABLE "investments" ADD CONSTRAINT "investments_accountId_accounts_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investments" ADD CONSTRAINT "investments_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactionToInvestments" ADD CONSTRAINT "transactionToInvestments_transactionId_transactions_id_fk" FOREIGN KEY ("transactionId") REFERENCES "public"."transactions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactionToInvestments" ADD CONSTRAINT "transactionToInvestments_investmentId_investments_id_fk" FOREIGN KEY ("investmentId") REFERENCES "public"."investments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investmentToGoals" ADD CONSTRAINT "investmentToGoals_investmentId_investments_id_fk" FOREIGN KEY ("investmentId") REFERENCES "public"."investments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "investmentToGoals" ADD CONSTRAINT "investmentToGoals_goalId_goals_id_fk" FOREIGN KEY ("goalId") REFERENCES "public"."goals"("id") ON DELETE cascade ON UPDATE no action;
