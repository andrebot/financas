import { QueryFilter } from './query';

/**
 * Interface for a repository.
 *
 * @template T - The type of the document.
 * @template K - The type of the returned object.
 */
export interface IRepository<T, K> {
  /**
   * Finds a document by its ID.
   *
   * @param id - The ID of the document to find.
   * @returns The found object or null if not found.
   */
  findById(id: string): Promise<K | null>;

  /**
   * Deletes a document by its ID.
   *
   * @param id - The ID of the document to delete.
   * @returns The deleted object or null if not found.
   */
  findByIdAndDelete(id: string): Promise<K | null>;

  /**
   * Finds documents based on the given query.
   *
   * @param query - The query to filter the documents.
   * @returns An array of found objects.
   */
  find(query: QueryFilter<T>): Promise<K[]>;

  /**
   * Finds a single document based on the given query.
   *
   * @param query - The query to filter the document.
   * @returns The found object or null if not found.
   */
  findOne(query: QueryFilter<T>): Promise<K | null>;

  /**
   * Saves a new document.
   *
   * @param entity - The object to save.
   * @returns The saved object.
   */
  save(entity?: K): Promise<K>;

  /**
   * Updates a document by its ID.
   *
   * @param id - The ID of the document to update.
   * @param entity - The partial object to update.
   * @returns The updated object or null if not found.
   */
  update(id: string, entity: Partial<K>): Promise<K | null>;
}
