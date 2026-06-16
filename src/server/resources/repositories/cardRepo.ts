import { and, eq } from 'drizzle-orm';
import Repository from './repository';
import { cards } from '../models/accountModel';
import { getDb } from '../../utils/transaction';
import type {
  ICard,
  ICardPayload,
  ICardRepo,
  ICardSyncPayload,
} from '../../types';

const baseCardRepo = Repository<typeof cards, ICard>(cards, 'Card');

/**
 * Converts a submitted card into the exact database fields accepted for insert/update.
 * Extra UI-only fields are intentionally ignored before passing data to Drizzle.
 *
 * @param card - The submitted card payload.
 * @returns The persisted card fields.
 */
function toCardPayload(card: ICardSyncPayload): ICardPayload {
  return {
    number: card.number,
    expirationDate: card.expirationDate,
    closingDay: card.closingDay,
  };
}

/**
 * Finds the persisted card that matches a submitted card id.
 *
 * @throws {Error} - If the submitted id does not belong to the account.
 *
 * @param existingCards - Cards currently persisted for the account.
 * @param submittedCard - The submitted card to validate.
 * @param accountId - The account being synchronized.
 * @returns The existing card with the submitted id.
 */
function findOwnedCard(
  existingCards: ICard[],
  submittedCard: ICardSyncPayload,
  accountId: number,
): ICard {
  const existingCard = existingCards.find((card) => card.id === submittedCard.id);

  if (!existingCard) {
    throw new Error(`Card id ${submittedCard.id} does not belong to account ${accountId}`);
  }

  return existingCard;
}

/**
 * Loads cards that are currently persisted for a single account.
 *
 * @param accountId - The account id to filter by.
 * @returns Cards belonging to the account.
 */
async function findByAccountId(accountId: number): Promise<ICard[]> {
  return getDb()
    .select()
    .from(cards)
    .where(eq(cards.accountId, accountId));
}

/**
 * Inserts a new card for an account.
 *
 * @param accountId - The owner account id.
 * @param card - The submitted card fields.
 * @returns The inserted card.
 */
async function insertCard(accountId: number, card: ICardSyncPayload): Promise<ICard> {
  const [savedCard] = await getDb()
    .insert(cards)
    .values({
      accountId,
      ...toCardPayload(card),
    })
    .returning();

  return savedCard;
}

/**
 * Updates an existing card that belongs to an account.
 *
 * @param accountId - The owner account id.
 * @param card - The submitted card fields, including id.
 * @returns The updated card.
 */
async function updateCard(accountId: number, card: ICardSyncPayload): Promise<ICard> {
  const [updatedCard] = await getDb()
    .update(cards)
    .set(toCardPayload(card))
    .where(and(
      eq(cards.id, card.id!),
      eq(cards.accountId, accountId),
    ))
    .returning();

  return updatedCard;
}

/**
 * Deletes one card from an account.
 *
 * @param accountId - The owner account id.
 * @param cardId - The card id to delete.
 */
async function deleteCard(accountId: number, cardId: number): Promise<void> {
  await getDb()
    .delete(cards)
    .where(and(
      eq(cards.id, cardId),
      eq(cards.accountId, accountId),
    ))
    .returning();
}

/**
 * Deletes persisted cards that were omitted from a submitted full card list.
 *
 * @param accountId - The owner account id.
 * @param existingCards - Cards currently persisted for the account.
 * @param submittedCards - The submitted full card list.
 */
async function deleteMissingCards(
  accountId: number,
  existingCards: ICard[],
  submittedCards: ICardSyncPayload[],
): Promise<void> {
  const submittedIds = new Set(submittedCards.map((card) => card.id).filter(Boolean));
  const cardsToDelete = existingCards.filter((card) => !submittedIds.has(card.id));

  await Promise.all(cardsToDelete.map((card) => deleteCard(accountId, card.id)));
}

/**
 * Inserts new cards and updates existing cards in the submitted full card list.
 *
 * @param accountId - The owner account id.
 * @param existingCards - Cards currently persisted for the account.
 * @param submittedCards - The submitted full card list.
 * @returns Inserted and updated cards.
 */
async function upsertSubmittedCards(
  accountId: number,
  existingCards: ICard[],
  submittedCards: ICardSyncPayload[],
): Promise<ICard[]> {
  const savedCards = await Promise.all(submittedCards.map((card) => {
    if (!card.id) {
      return insertCard(accountId, card);
    }

    findOwnedCard(existingCards, card, accountId);

    return updateCard(accountId, card);
  }));

  return savedCards;
}

/**
 * Reconciles cards persisted for an account with the full card list submitted by the UI.
 * Submitted cards without ids are inserted, submitted cards with ids are updated, and
 * existing cards omitted from the submitted list are deleted.
 *
 * @param accountId - The owner account id.
 * @param submittedCards - The full card list submitted by the UI.
 * @returns The cards that remain persisted for the account.
 */
async function syncAccountCards(
  accountId: number,
  submittedCards: ICardSyncPayload[],
): Promise<ICard[]> {
  const existingCards = await findByAccountId(accountId);

  await deleteMissingCards(accountId, existingCards, submittedCards);

  return upsertSubmittedCards(accountId, existingCards, submittedCards);
}

export default {
  ...baseCardRepo,
  findByAccountId,
  syncAccountCards,
} satisfies ICardRepo;
