import { eq } from 'drizzle-orm';
import Repository from './repository';
import { users } from '../models/userModel';
import { db } from '../../utils/databaseConnection';
import { createLogger } from '../../utils/logger';
import type { IUser } from '../../types';

const logger = createLogger('Repository:User');
const userRepo = Repository<typeof users, IUser>(users, 'User', logger);

async function findByEmail(email: string): Promise<IUser | null> {
  logger.info(`Finding user by email: ${email}`);

  const user = await db.select().from(users).where(eq(users.email, email)).limit(1);

  return user.length > 0 ? user[0] : null;
}

export default {
  ...userRepo,
  findByEmail,
};
