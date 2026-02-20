import { Document } from 'mongoose';
import { createLogger } from '../../utils/logger';
import { checkVoidPayload, checkVoidInstance, checkUserAccess } from '../../utils/misc';
import type { Content, ICommonActions } from '../../types';
import type { IRepository } from '../../resources/repositories/IRepository';

/**
 * Creates a common actions for a given repository and model name.
 *
 * @remarks
 * Most of the content in this application content are simple and use the same logic for their
 * CRUD, so this abstracts most of the code so we don't have to repeat ourselves.
 *
 * @param repository - The repository to use.
 * @param modelName - The name of the model.
 * @returns The common actions.
 */
export default function CommonActions<T extends Document, K extends Content>(
  repository: IRepository<T, K>,
  modelName: string,
): ICommonActions<K> {
  const logger = createLogger(`CommonActions:${modelName}`);

  /**
   * Creates a new content.
   *
   * @throws {Error} - If the payload is void.
   *
   * @param content - The content to create.
   * @returns The created content.
   */
  function createContent(
    content: K,
  ): Promise<K> {
    logger.info(`Creating content for ${modelName}`);

    checkVoidPayload(content, modelName, 'create');

    return repository.save(content);
  }

  /**
   * Updates a content.
   *
   * @throws {Error} - If the payload is void.
   * @throws {Error} - If the content is not found.
   * @throws {Error} - If the user is not authorized to update the content.
   *
   * @param id - The id of the content to update.
   * @param payload - The payload to update the content with.
   * @param userId - The id of the user updating the content.
   * @param isAdmin - Whether the user is an admin.
   * @returns The updated content.
   */
  async function updateContent(
    id: string,
    payload: Partial<K>,
    userId: string,
    isAdmin: boolean,
  ): Promise<K | null> {
    logger.info(`Updating content for ${modelName} with id ${id}`);

    checkVoidPayload(payload, modelName, 'update');

    const instance = await repository.findById(id);

    checkVoidInstance(instance, modelName, id);
    checkUserAccess(instance!.user.toString(), userId, isAdmin, modelName, id, 'update', logger);

    return repository.update(id, payload);
  }

  /**
   * Deletes a content by id.
   *
   * @throws {Error} - If the content is not found.
   * @throws {Error} - If the user is not authorized to delete the content.
   *
   * @param id - The id of the content to delete.
   * @param userId - The id of the user deleting the content.
   * @param isAdmin - Whether the user is an admin.
   * @returns The deleted content.
   */
  async function deleteContent(
    id: string,
    userId: string,
    isAdmin: boolean,
  ): Promise<K | null> {
    logger.info(`Deleting content for ${modelName} with id ${id}`);

    const instance = await repository.findById(id);

    checkVoidInstance(instance, modelName, id);
    checkUserAccess(instance!.user.toString(), userId, isAdmin, modelName, id, 'delete', logger);

    return repository.findByIdAndDelete(id);
  }

  /**
   * Lists all content for a user.
   *
   * @param userId - The id of the user listing the content.
   * @returns The list of content.
   */
  async function listContent(
    userId: string,
  ): Promise<K[]> {
    logger.info(`Listing content for ${modelName} for user ${userId}`);

    return repository.listAll(userId);
  }

  /**
   * Gets a content by id.
   *
   * @throws {Error} - If the user is not authorized to get the content.
   *
   * @param id - The id of the content to get.
   * @param userId - The id of the user getting the content.
   * @param isAdmin - Whether the user is an admin.
   * @returns The content.
   */
  async function getContent(
    id: string,
    userId: string,
    isAdmin: boolean,
  ): Promise<K | null> {
    logger.info(`Getting content for ${modelName} with id ${id}`);

    const instance = await repository.findById(id);

    if (!instance) {
      return null;
    }

    checkUserAccess(instance.user.toString(), userId, isAdmin, modelName, id, 'get', logger);

    return instance;
  }

  return {
    createContent,
    updateContent,
    deleteContent,
    listContent,
    getContent,
  };
}
