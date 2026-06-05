import { eq } from 'drizzle-orm';
import Repository from './repository';
import { users } from '../models/userModel';
import { db } from '../../utils/databaseConnection';
import { createLogger } from '../../utils/logger';
import type { IUser } from '../../types';

const logger = createLogger('Repository:User');
const userRepo = Repository<typeof users, IUser>(users, 'User', logger);

/**
 * Finds a user by their unique email address.
 *
 * @param email - The email to search for.
 * @returns The matching user, or null when no user exists.
 */
async function findByEmail(email: string): Promise<IUser | null> {
  logger.info(`Finding user by email: ${email}`);

  const user = await db.select().from(users).where(eq(users.email, email)).limit(1);

  return user.length > 0 ? user[0] : null;
}

/**
 * Updates only the stored password for a user without requiring a request
 * authorization context. Password reset runs before authentication, so it
 * cannot use the generic repository update method that applies tenant scoping.
 *
 * @param id - The id of the user whose password should be replaced.
 * @param password - The already-hashed password to store.
 * @returns The updated user record.
 */
async function updatePasswordById(id: number, password: string): Promise<IUser | null> {
  logger.info(`Updating password for user by id: ${id}`);

  const [user] = await db.update(users).set({ password }).where(eq(users.id, id)).returning();

  return user ?? null;
}

export default {
  ...userRepo,
  findByEmail,
  updatePasswordById,
};
