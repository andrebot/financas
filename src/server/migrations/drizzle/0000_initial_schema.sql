CREATE TYPE "public"."budgetTypes" AS ENUM('annualy', 'quarterly', 'monthly', 'weekly', 'daily');--> statement-breakpoint
CREATE TYPE "public"."investmentTypes" AS ENUM('cdb', 'lci', 'lca', 'stock', 'fund', 'cra', 'cri', 'debenture', 'currency', 'lc', 'lf', 'fii', 'tresury', 'mutual_fund', 'crypto', 'real_estate', 'other');--> statement-breakpoint
CREATE TYPE "public"."roles" AS ENUM('admin', 'user');--> statement-breakpoint
CREATE TYPE "public"."transactionTypes" AS ENUM('withdraw', 'transferIn', 'transferOut', 'deposit', 'bankSlip', 'cardPurchase', 'cardRefund', 'payment', 'investmentBuy', 'investmentSell', 'investmentDividend', 'investmentInterest');--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"currency" text NOT NULL,
	"agency" text NOT NULL,
	"accountNumber" text NOT NULL,
	"initialBalance" numeric(14, 2) NOT NULL,
	"userId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "cards" (
	"id" serial PRIMARY KEY NOT NULL,
	"number" text NOT NULL,
	"expirationDate" text NOT NULL,
	"accountId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "budgetToCategories" (
	"budgetId" integer NOT NULL,
	"categoryId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	CONSTRAINT "budgetToCategories_budgetId_categoryId_pk" PRIMARY KEY("budgetId","categoryId")
);
--> statement-breakpoint
CREATE TABLE "budgetUsage" (
	"budgetId" integer NOT NULL,
	"transactionId" integer NOT NULL,
	"date" timestamp NOT NULL,
	"valueUsed" numeric(14, 2) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	CONSTRAINT "budgetUsage_budgetId_transactionId_pk" PRIMARY KEY("budgetId","transactionId")
);
--> statement-breakpoint
CREATE TABLE "budgets" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"value" numeric(14, 2) NOT NULL,
	"type" "budgetTypes" NOT NULL,
	"startDate" timestamp NOT NULL,
	"endDate" timestamp NOT NULL,
	"userId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"userId" integer NOT NULL,
	"parentCategoryId" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "goals" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"value" integer NOT NULL,
	"savedValue" numeric(14, 2) NOT NULL,
	"dueDate" timestamp NOT NULL,
	"archived" boolean DEFAULT false,
	"userId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "monthlyBalances" (
	"id" serial PRIMARY KEY NOT NULL,
	"accountId" integer NOT NULL,
	"year" integer NOT NULL,
	"month" integer NOT NULL,
	"openingBalance" numeric(14, 2) NOT NULL,
	"closingBalance" numeric(14, 2) NOT NULL,
	"totalIn" numeric(14, 2) NOT NULL,
	"totalOut" numeric(14, 2) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"categoryId" integer,
	"accountId" integer NOT NULL,
	"type" "transactionTypes" NOT NULL,
	"date" timestamp NOT NULL,
	"value" numeric(14, 2) NOT NULL,
	"investmentType" "investmentTypes",
	"userId" integer NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"firstName" text NOT NULL,
	"lastName" text NOT NULL,
	"role" "roles" DEFAULT 'user' NOT NULL,
	"password" text NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "transactionToGoals" (
	"transactionId" integer NOT NULL,
	"goalId" integer NOT NULL,
	"percentage" numeric(14, 2) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp,
	CONSTRAINT "transactionToGoals_transactionId_goalId_pk" PRIMARY KEY("transactionId","goalId")
);
--> statement-breakpoint
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cards" ADD CONSTRAINT "cards_accountId_accounts_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budgetToCategories" ADD CONSTRAINT "budgetToCategories_budgetId_budgets_id_fk" FOREIGN KEY ("budgetId") REFERENCES "public"."budgets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budgetToCategories" ADD CONSTRAINT "budgetToCategories_categoryId_categories_id_fk" FOREIGN KEY ("categoryId") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budgetUsage" ADD CONSTRAINT "budgetUsage_budgetId_budgets_id_fk" FOREIGN KEY ("budgetId") REFERENCES "public"."budgets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budgetUsage" ADD CONSTRAINT "budgetUsage_transactionId_transactions_id_fk" FOREIGN KEY ("transactionId") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budgets" ADD CONSTRAINT "budgets_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_parentCategoryId_categories_id_fk" FOREIGN KEY ("parentCategoryId") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "goals" ADD CONSTRAINT "goals_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monthlyBalances" ADD CONSTRAINT "monthlyBalances_accountId_accounts_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_categoryId_categories_id_fk" FOREIGN KEY ("categoryId") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_accountId_accounts_id_fk" FOREIGN KEY ("accountId") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_userId_users_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactionToGoals" ADD CONSTRAINT "transactionToGoals_transactionId_transactions_id_fk" FOREIGN KEY ("transactionId") REFERENCES "public"."transactions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactionToGoals" ADD CONSTRAINT "transactionToGoals_goalId_goals_id_fk" FOREIGN KEY ("goalId") REFERENCES "public"."goals"("id") ON DELETE no action ON UPDATE no action;