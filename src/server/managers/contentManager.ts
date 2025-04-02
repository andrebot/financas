import type { Logger } from 'winston';
import { IRepository } from '../resources/repositories/IRepository';
import { checkVoidPayload, checkVoidInstance } from '../utils/misc';
import { createLogger } from '../utils/logger';

export type Content = { user: string };

export default class ContentManager<T extends Content> {
  protected repository: IRepository<T, T>;

  protected logger: Logger;

  modelName: string;

  constructor(repository: IRepository<T, T>, managerName: string) {
    this.repository = repository;
    this.modelName = repository.modelName;
    this.logger = createLogger(`${managerName}`);
  }

  /**
 * Check if the user has access to the content
 *
 * @param contentOwnerId - The id of the user who owns the content
 * @param userId - The id of the user trying to access the content
 * @param isAdmin - Whether the user is an admin
 * @param modelName - The name of the model
 * @param contentId - The id of the content
 * @param action - The action to check access for
 */
  private checkUserAccess(
    contentOwnerId: string,
    userId: string,
    isAdmin: boolean,
    modelName: string,
    contentId: string,
    action: string,
  ): void {
    if (!isAdmin && contentOwnerId !== userId) {
      throw new Error(`User ${userId} is not allowed to ${action} ${modelName} with id ${contentId}`);
    }
  }

  /**
   * Save content to the database
   *
   * @throws {Error} - If no content is provided
   * @throws {Error} - If the content cannot be saved
   *
   * @param content - The content to save
   * @param ContentModel - The model to save the content to
   * @returns The saved content
   */
  createContent(content: T): Promise<T> {
    checkVoidPayload(content, this.repository.modelName, 'create');

    return this.repository.save(content);
  }

  /**
   * Update content in the database
   *
   * @throws {Error} - If no information is provided to update the content
   * @throws {Error} - If the content is not found
   * @throws {Error} - If the user is not allowed to update the content
   * @throws {Error} - If the content cannot be updated
   *
   * @param id - The id of the content to update
   * @param payload - The updated content
   * @param ContentModel - The model to update the content in
   * @param userId - The id of the user updating the content
   * @param isAdmin - Whether the user is an admin
   * @returns The updated content
   */
  async updateContent(
    id: string,
    payload: Partial<T>,
    userId: string,
    isAdmin: boolean = false,
  ): Promise<T | null> {
    checkVoidPayload(payload, this.repository.modelName, 'update');

    const instance = await this.repository.findById(id);

    checkVoidInstance(instance, this.repository.modelName, id);
    this.checkUserAccess(instance!.user.toString(), userId, isAdmin, this.repository.modelName, id, 'update');

    return this.repository.update(id, payload);
  }

  /**
   * Delete content from the database
   *
   * @throws {Error} - If the content is not found
   * @throws {Error} - If the user is not allowed to delete the content
   * @throws {Error} - If the content cannot be deleted
   *
   * @param id - The id of the content to delete
   * @param ContentModel - The model to delete the content from
   * @param userId - The id of the user deleting the content
   * @param isAdmin - Whether the user is an admin
   * @returns The deleted content
   */
  async deleteContent(
    id: string,
    userId: string,
    isAdmin: boolean = false,
  ): Promise<T | null> {
    const instance = await this.repository.findById(id);

    checkVoidInstance(instance, this.repository.modelName, id);
    this.checkUserAccess(instance!.user.toString(), userId, isAdmin, this.repository.modelName, id, 'delete');

    return this.repository.findByIdAndDelete(id);
  }

  /**
   * List content from the database
   *
   * @throws {Error} - If the content cannot be listed
   *
   * @param query - The query to filter the content. Default is an empty object to list all objects
   * @param ContentModel - The model to list the content from
   * @param userId - The id of the user listing the content
   * @returns The list of content
   */
  async listContent(
    userId?: string,
  ): Promise<T[]> {
    return this.repository.listAll(userId);
  }

  /**
   * Get content from the database
   *
   * @param id - The id of the content to get
   * @param ContentModel - The model to get the content from
   * @param userId - The id of the user getting the content
   * @returns The content
   */
  async getContent(
    id: string,
  ): Promise<T | null> {
    return this.repository.findById(id);
  }
}
