import type { EventHandler, ITransaction, IInvestment } from '../types';

export const EVENTS = {
  TRANSACTION_CREATED: 'transaction:created',
  TRANSACTION_UPDATED: 'transaction:updated',
  TRANSACTION_DELETED: 'transaction:deleted',
  INVESTMENT_CREATED: 'investment:created',
  INVESTMENT_UPDATED: 'investment:updated',
  INVESTMENT_DELETED: 'investment:deleted',
  INVESTMENT_ARCHIVED: 'investment:archived',
} as const;

export type AppEvents = {
  [EVENTS.TRANSACTION_CREATED]: ITransaction;
  [EVENTS.TRANSACTION_UPDATED]: ITransaction;
  [EVENTS.TRANSACTION_DELETED]: ITransaction;
  [EVENTS.INVESTMENT_CREATED]: IInvestment;
  [EVENTS.INVESTMENT_UPDATED]: IInvestment;
  [EVENTS.INVESTMENT_DELETED]: IInvestment;
  [EVENTS.INVESTMENT_ARCHIVED]: IInvestment;
};

const channels = new Map<keyof AppEvents, Set<EventHandler>>();

/**
 * Registers a handler for an event. Returns an unsubscribe function that
 * removes only this handler when called.
 *
 * @param event - The event name to listen for.
 * @param handler - The callback invoked with the event payload.
 * @returns A zero-argument function that unregisters the handler.
 */
export function subscribe<K extends keyof AppEvents>(
  event: K,
  handler: EventHandler<AppEvents[K]>,
): () => void {
  const existing = channels.get(event) ?? new Set<EventHandler>();
  existing.add(handler as EventHandler);
  channels.set(event, existing);

  return () => {
    channels.get(event)?.delete(handler as EventHandler);
  };
}

/**
 * Publishes an event, invoking all registered handlers in parallel.
 * Rejects if any handler rejects.
 *
 * @param event - The event name to emit.
 * @param data - The payload delivered to every handler.
 */
export async function publish<K extends keyof AppEvents>(
  event: K,
  data: AppEvents[K],
): Promise<void> {
  const handlers = channels.get(event);

  if (!handlers || handlers.size === 0) {
    return;
  }

  await Promise.all(Array.from(handlers).map((h) => h(data)));
}

/**
 * Removes all subscribers from every channel. Intended for use in tests.
 */
export function clear(): void {
  channels.clear();
}
