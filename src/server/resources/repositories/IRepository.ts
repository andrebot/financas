/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */

/**
 * Interface for a repository.
 *
 * @template T - The type of the document.
 * @template K - The type of the returned object.
 */
export interface IRepository<T, K> {
  /**
   * The name of the model.
   */
  modelName: string;

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
   * Finds all documents.
   *
   * @param userId - The id of the user to filter the documents by.
   * @returns An array of found objects.
   */
  listAll(userId?: string): Promise<K[]>;

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
