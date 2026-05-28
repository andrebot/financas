import { getAutorizationDatabaseContext } from '../../utils/authorization';
import { getDb } from '../../utils/transaction';
import { accounts } from '../models/accountModel';
import Repository from './repository';
import type { IAccount, IAccountRepo, IAccountWithCards } from '../../types';

const baseAccountRepo = Repository<typeof accounts, IAccount>(accounts, 'Account');

/**
 * Lists all accounts visible in the current authorization context with related cards hydrated.
 *
 * @returns Accounts with their persisted cards loaded through Drizzle relations.
 */
async function listAllWithCards(): Promise<IAccountWithCards[]> {
  const where = getAutorizationDatabaseContext(accounts);

  return getDb().query.accounts.findMany({
    ...(where ? { where } : {}),
    with: { cards: true },
  });
}

export default {
  ...baseAccountRepo,
  listAllWithCards,
} satisfies IAccountRepo;
