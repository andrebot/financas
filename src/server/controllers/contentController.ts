import { Response } from 'express';
import ContentManager from '../managers/contentManager';
import { handleError } from '../utils/responseHandlers';
import type { RequestWithUser, IContentController } from '../types';
import type { Content } from '../managers/contentManager';
import { checkVoidPayload, checkVoidUser } from '../utils/misc';
import { createLogger } from '../utils/logger';
import type { Logger } from 'winston';

export default class ContentController<T extends Content> implements IContentController {
  protected manager: ContentManager<T>;
  protected errorHandler: (error: Error, res: Response) => Response;
  protected logger: Logger;

  constructor(
    manager: ContentManager<T>,
    controllerName: string,
    errorHandler: (error: Error, res: Response) => Response = handleError,
  ) {
    this.manager = manager;
    this.errorHandler = errorHandler;
    this.logger = createLogger(`${controllerName}Controller`);
  }

  /**
   * Creates the content.
   *
   * @param req - The request object
   * @param res - The response object
   * @returns The content
   */
  async createContent(req: RequestWithUser, res: Response) {
    try {
      checkVoidUser(req.user, this.manager.modelName, 'create');
      checkVoidPayload(req.body, this.manager.modelName, 'create');

      const content = await this.manager.createContent(req.body);

      return res.send(content);
    } catch (error) {
      return this.errorHandler(error as Error, res);
    }
  }

  /**
   * Updates the content.
   *
   * @param req - The request object
   * @param res - The response object
   * @param model - The model to update the content from
   * @param contentId - The id of the content to update
   * @throws {Error} - If the user is not authenticated
   */
  async updateContent(
    req: RequestWithUser,
    res: Response,
  ): Promise<Response<T>> {
    try {
      const { id: contentId } = req.params;
      const { user } = req;
      const updateProperties = req.body;

      checkVoidUser(user, this.manager.modelName, 'update');
      checkVoidPayload(updateProperties, this.manager.modelName, 'update');

      const content = await this.manager.updateContent(
        contentId,
        updateProperties,
        user!.id!,
        user!.role === 'admin',
      );

      return res.send(content);
    } catch (error) {
      return this.errorHandler(error as Error, res);
    }
  }

  /**
   * Deletes the content.
   *
   * @param req - The request object
   * @param res - The response object
   * @param model - The model to delete the content from
   * @param contentId - The id of the content to delete
   * @throws {Error} - If the user is not authenticated
   */
  async deleteContent(
    req: RequestWithUser,
    res: Response,
  ): Promise<Response<T>> {
    try {
      const { id: contentId } = req.params;
      const { user } = req;

      checkVoidUser(user, this.manager.modelName, 'delete');

      if (!contentId) {
        throw new Error('Content id is required for deleting action');
      }

      const content = await this.manager.deleteContent(
        contentId,
        user!.id!,
        user!.role === 'admin',
      );

      return res.send(content);
    } catch (error) {
      return this.errorHandler(error as Error, res);
    }
  }

  /**
   * Lists all the content by user.
   *
   * @param req - The request object
   * @param res - The response object
   * @returns The content
   */
  async listContent(req: RequestWithUser, res: Response): Promise<Response<T>> {
    try {
      checkVoidUser(req.user, this.manager.modelName, 'list');

      const content = await this.manager.listContent(req.user?.id);

      return res.send(content);
    } catch (error) {
      return this.errorHandler(error as Error, res);
    }
  }

  /**
   * Gets the content.
   *
   * @param req - The request object
   * @param res - The response object
   * @returns The content
   */
  async getContent(req: RequestWithUser, res: Response): Promise<Response<T>> {
    try {
      const { id: contentId } = req.params;
      const { user } = req;

      checkVoidUser(user, this.manager.modelName, 'get');

      const content = await this.manager.getContent(contentId);

      return res.send(content);
    } catch (error) {
      return this.errorHandler(error as Error, res);
    }
  }
}
