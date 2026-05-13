import { PGlite } from '@electric-sql/pglite';
import { drizzle } from 'drizzle-orm/pglite';
import { migrate } from 'drizzle-orm/pglite/migrator';
import bcrypt from 'bcrypt';
import path from 'path';
import * as databaseConnection from '../../src/server/utils/databaseConnection';
import * as schema from '../../src/server/resources/models/schema';
const MIGRATIONS_PATH = path.resolve(__dirname, '../../src/server/migrations/drizzle');

export const adminUser = { id: 0, email: 'admin@example.com', firstName: 'Admin', lastName: 'User', role: 'admin' as const };
export const userToDelete = { id: 0, email: 'user1@example.com', firstName: 'User', lastName: 'Delete', role: 'user' as const };
export const otherUser = { id: 0, email: 'other@example.com', firstName: 'Other', lastName: 'User', role: 'user' as const };

export const account1 = { id: 0, name: 'Test Account 1', agency: '1234', accountNumber: '123456', currency: 'BRL', initialBalance: '0.00' };
export const account2 = { id: 0, name: 'Test Account 2', agency: '5678', accountNumber: '567890', currency: 'USD', initialBalance: '0.00' };
export const account3 = { id: 0, name: 'Test Account 3', agency: '9012', accountNumber: '901234', currency: 'USD', initialBalance: '0.00' };

export const category1 = { id: 0, name: 'Test Category 1' };
export const category2 = { id: 0, name: 'Test Category 2' };
export const category3 = { id: 0, name: 'Test Category 3' };

export const goal1 = { id: 0, name: 'Test Goal 1', value: 100, dueDate: new Date('2026-12-31') };
export const goal2 = { id: 0, name: 'Test Goal 2', value: 200, dueDate: new Date('2026-12-31') };
export const goal3 = { id: 0, name: 'Test Goal 3', value: 300, dueDate: new Date('2026-12-31') };

export const budget1 = { id: 0, name: 'Test Budget 1', value: '100.00', type: 'monthly' as const, startDate: new Date('2026-01-01'), endDate: new Date('2026-12-31') };
export const budget2 = { id: 0, name: 'Test Budget 2', value: '100.00', type: 'annualy' as const, startDate: new Date('2026-01-01'), endDate: new Date('2026-12-31') };
export const budget3 = { id: 0, name: 'Test Budget 3', value: '100.00', type: 'quarterly' as const, startDate: new Date('2026-01-01'), endDate: new Date('2026-12-31') };

export const transaction1 = { id: 0, name: 'Test Transaction 1', type: 'withdraw' as const, date: new Date('2026-01-15'), value: '100.00', investmentType: null as null };
export const transaction2 = { id: 0, name: 'Test Transaction 2', type: 'investmentBuy' as const, date: new Date('2026-01-15'), value: '200.00', investmentType: 'lci' as const };
export const transaction3 = { id: 0, name: 'Test Transaction 3', type: 'investmentBuy' as const, date: new Date('2026-01-15'), value: '300.00', investmentType: 'lca' as const };

let pglite: PGlite;
let db: ReturnType<typeof drizzle<typeof schema>>;

/**
 * Creates an in-memory PGLite database, runs migrations, and wires it into
 * the application's databaseConnection module so all repos use it.
 */
export const connectToDatabase = async (): Promise<void> => {
  pglite = new PGlite();
  db = drizzle(pglite, { schema });

  await migrate(db, { migrationsFolder: MIGRATIONS_PATH });

  (databaseConnection as unknown as { db: unknown }).db = db;
};

/**
 * Closes the in-memory PGLite instance.
 */
export const disconnectDatabase = async (): Promise<void> => {
  await pglite.close();
};

/**
 * Seeds the admin user and stores its generated id back on the fixture.
 */
export const createAdminUser = async (): Promise<void> => {
  const password = await bcrypt.hash('adminPassword', 10);
  const [user] = await db.insert(schema.users).values({
    email: adminUser.email,
    firstName: adminUser.firstName,
    lastName: adminUser.lastName,
    role: adminUser.role,
    password,
  }).returning();
  adminUser.id = user.id;
};

/**
 * Seeds the user-to-delete fixture and stores its generated id.
 */
export const createUserToDelete = async (): Promise<void> => {
  const password = await bcrypt.hash('Maro-fjik23', 10);
  const [user] = await db.insert(schema.users).values({
    email: userToDelete.email,
    firstName: userToDelete.firstName,
    lastName: userToDelete.lastName,
    role: userToDelete.role,
    password,
  }).returning();
  userToDelete.id = user.id;
};

/**
 * Seeds the other user fixture and stores its generated id.
 * Used for cross-user authorization tests.
 */
export const createOtherUser = async (): Promise<void> => {
  const password = await bcrypt.hash('OtherPass-99', 10);
  const [user] = await db.insert(schema.users).values({
    email: otherUser.email,
    firstName: otherUser.firstName,
    lastName: otherUser.lastName,
    role: otherUser.role,
    password,
  }).returning();
  otherUser.id = user.id;
};

/**
 * Seeds an account for the given userId and stores its generated id on the fixture.
 *
 * @param account - The account fixture to seed.
 * @param userId - The id of the user who owns the account.
 */
export const createAccount = async (
  account: typeof account1,
  userId: number,
): Promise<void> => {
  const [saved] = await db.insert(schema.accounts).values({
    name: account.name,
    agency: account.agency,
    accountNumber: account.accountNumber,
    currency: account.currency,
    initialBalance: account.initialBalance,
    userId,
  }).returning();
  account.id = saved.id;
};

/**
 * Seeds a category for the given userId and stores its generated id on the fixture.
 *
 * @param category - The category fixture to seed.
 * @param userId - The id of the user who owns the category.
 * @param parentCategoryId - Optional parent category id.
 */
export const createCategory = async (
  category: typeof category1,
  userId: number,
  parentCategoryId?: number,
): Promise<void> => {
  const [saved] = await db.insert(schema.categories).values({
    name: category.name,
    userId,
    parentCategoryId: parentCategoryId ?? null,
  }).returning();
  category.id = saved.id;
};

/**
 * Seeds a goal for the given userId and stores its generated id on the fixture.
 *
 * @param goal - The goal fixture to seed.
 * @param userId - The id of the user who owns the goal.
 */
export const createGoal = async (
  goal: typeof goal1,
  userId: number,
): Promise<void> => {
  const [saved] = await db.insert(schema.goals).values({
    name: goal.name,
    value: goal.value,
    savedValue: '0',
    dueDate: goal.dueDate,
    userId,
  }).returning();
  goal.id = saved.id;
};

/**
 * Seeds a budget for the given userId, links it to the provided category ids,
 * and stores its generated id on the fixture.
 *
 * @param budget - The budget fixture to seed.
 * @param userId - The id of the user who owns the budget.
 * @param categoryIds - Category ids to link via budgetToCategories.
 */
export const createBudget = async (
  budget: typeof budget1 | typeof budget2 | typeof budget3,
  userId: number,
  categoryIds: number[] = [],
): Promise<void> => {
  const [saved] = await db.insert(schema.budgets).values({
    name: budget.name,
    value: budget.value,
    type: budget.type,
    startDate: budget.startDate,
    endDate: budget.endDate,
    userId,
  }).returning();
  budget.id = saved.id;

  for (const categoryId of categoryIds) {
    await db.insert(schema.budgetToCategories).values({ budgetId: saved.id, categoryId });
  }
};

/**
 * Seeds a transaction for the given userId and accountId, and stores its generated id.
 *
 * @param transaction - The transaction fixture to seed.
 * @param userId - The id of the user who owns the transaction.
 * @param accountId - The id of the account the transaction belongs to.
 * @param categoryId - Optional category id for the transaction.
 */
export const createTransaction = async (
  transaction: typeof transaction1 | typeof transaction2 | typeof transaction3,
  userId: number,
  accountId: number,
  categoryId?: number,
): Promise<void> => {
  const [saved] = await db.insert(schema.transactions).values({
    name: transaction.name,
    type: transaction.type,
    date: transaction.date,
    value: transaction.value,
    investmentType: transaction.investmentType,
    userId,
    accountId,
    categoryId: categoryId ?? null,
  }).returning();
  transaction.id = saved.id;
};
