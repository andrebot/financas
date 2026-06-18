type EventHandler<T = unknown> = (data: T) => void | Promise<void>;

/** Typed publish-subscribe bus. E maps event names to their payload types. */
export interface IPubSub<E extends Record<string, unknown> = Record<string, unknown>> {
  /**
   * Registers a handler for an event.
   * Returns an unsubscribe function that removes only this handler.
   *
   * @param event - The event name to listen for.
   * @param handler - The callback invoked when the event is published.
   * @returns A zero-argument function that unregisters the handler.
   */
  subscribe<K extends keyof E>(event: K, handler: EventHandler<E[K]>): () => void;
  /**
   * Publishes an event, invoking all registered handlers in parallel.
   * Rejects if any handler rejects.
   *
   * @param event - The event name to emit.
   * @param data - The payload delivered to every handler.
   */
  publish<K extends keyof E>(event: K, data: E[K]): Promise<void>;
}

/**
 * Creates a typed publish-subscribe bus.
 * Handlers for the same event run in parallel via Promise.all.
 *
 * @returns An {@link IPubSub} instance.
 */
export default function PubSub<
  E extends Record<string, unknown>,
>(): IPubSub<E> {
  const channels = new Map<keyof E, Set<EventHandler>>();

  function subscribe<K extends keyof E>(event: K, handler: EventHandler<E[K]>): () => void {
    const existing = channels.get(event) ?? new Set<EventHandler>();
    existing.add(handler as EventHandler);
    channels.set(event, existing);

    return () => {
      channels.get(event)?.delete(handler as EventHandler);
    };
  }

  async function publish<K extends keyof E>(event: K, data: E[K]): Promise<void> {
    const handlers = channels.get(event);
    if (!handlers || handlers.size === 0) return;
    await Promise.all(Array.from(handlers).map((h) => h(data)));
  }

  return { subscribe, publish };
}
