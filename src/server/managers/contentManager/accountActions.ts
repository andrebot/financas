import { Logger } from 'winston';
import commonActions from './commonActions';
import { withTransaction } from '../../utils/transaction';
import { checkVoidPayload } from '../../utils/misc';
import type {
  IAccountRepo,
  ICardRepo,
  ICommonActions,
  IAccountPayload,
  IAccount,
} from '../../types';

/**
 * Splits the account table fields from the optional full card list submitted by the UI.
 *
 * @param payload - The account payload received by the account actions.
 * @returns Account fields and the submitted card list as separate values.
 */
function splitAccountPayload(payload: IAccountPayload): {
  account: Partial<IAccount>;
  cards: IAccountPayload['cards'];
} {
  const { cards: submittedCards, ...account } = payload;

  return { account, cards: submittedCards };
}

/**
 * Lists all accounts with their cards.
 *
 * @param accountRepo - The account repository to use.
 * @param logger - The logger to use.
 * @returns The list of accounts with their cards.
 */
async function listAccounts(accountRepo: IAccountRepo, logger: Logger): Promise<IAccountPayload[]> {
  logger.info('Listing accounts');

  return accountRepo.listAllWithCards();
}

/**
 * Updates an account with its cards.
 *
 * @param accountRepo - The account repository to use.
 * @param cardRepo - The card repository to use.
 * @param id - The id of the account to update.
 * @param payload - The payload to update the account with.
 * @param logger - The logger to use.
 * @returns The updated account.
 */
async function updateAccount(
  accountRepo: IAccountRepo,
  cardRepo: ICardRepo,
  id: number,
  payload: Partial<IAccountPayload>,
  logger: Logger,
): Promise<IAccount | null> {
  logger.info(`Updating Account with id ${id}`);

  checkVoidPayload(payload, 'Account', 'update');

  const { account, cards: submittedCards } = splitAccountPayload(payload as IAccountPayload);

  return withTransaction(async () => {
    const updatedAccount = await accountRepo.update(id, account);

    if (updatedAccount && submittedCards !== undefined) {
      logger.info(`Syncing cards for Account with id ${id}`);
      await cardRepo.syncAccountCards(id, submittedCards);
    }

    logger.info(`Account updated with id ${id}`);
    return updatedAccount;
  });
}

/**
 * Creates an account with its cards.
 *
 * @param accountRepo - The account repository to use.
 * @param cardRepo - The card repository to use.
 * @param payload - The payload to create the account with.
 * @param logger - The logger to use.
 * @returns The created account.
 */
async function createAccount(
  accountRepo: IAccountRepo,
  cardRepo: ICardRepo,
  payload: IAccountPayload,
  logger: Logger,
): Promise<IAccount> {
  logger.info('Creating Account');

  checkVoidPayload(payload, 'Account', 'create');

  const { account, cards: submittedCards } = splitAccountPayload(payload);

  return withTransaction(async () => {
    const savedAccount = await accountRepo.save(account);

    if (submittedCards !== undefined) {
      logger.info(`Syncing cards for Account with id ${savedAccount.id}`);

      await cardRepo.syncAccountCards(savedAccount.id, submittedCards);
    }

    logger.info(`Account created with id ${savedAccount.id}`);

    return savedAccount;
  });
  
}

/**
 * Creates account actions that coordinate account persistence with card list reconciliation.
 *
 * @param accountRepo - The account repository to use.
 * @param cardRepo - The card repository to use.
 * @param logger - The logger to use.
 * @returns The account actions.
 */
export default function createAccountActions(
  accountRepo: IAccountRepo,
  cardRepo: ICardRepo,
  logger: Logger,
): ICommonActions<IAccountPayload> {
  const commonAccountActions = commonActions(accountRepo, 'Account');

  return {
    ...commonAccountActions,
    createContent: async (payload: IAccountPayload): Promise<IAccount> => {
      return createAccount(accountRepo, cardRepo, payload, logger);
    },
    updateContent: async (
      id: number,
      payload: Partial<IAccountPayload>,
    ): Promise<IAccount | null> => {
      return updateAccount(accountRepo, cardRepo, id, payload, logger);
    },
    listContent: async (): Promise<IAccountPayload[]> => {
      return listAccounts(accountRepo, logger);
    },
  };
}
