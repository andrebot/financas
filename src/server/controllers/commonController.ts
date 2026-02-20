import { Response } from 'express';
import { RequestWithUser } from '../types';
import { createLogger } from '../utils/logger';
import { checkVoidUser, checkVoidPayload } from '../utils/misc';
import { handleError } from '../utils/responseHandlers';
import type { Content, ICommonController, ICommonActions } from '../types';

/**
 * Creates a common controller for a given manager and controller name.
 *
 * @param manager - The manager to use.
 * @param controllerName - The name of the controller.
 * @param errorHandler - The error handler to use.
 * @returns The common controller.
 */
export default function CommonController<T extends Content>(
  manager: ICommonActions<T>,
  controllerName: string,
  errorHandler: (error: Error, res: Response) => Response = handleError,
): ICommonController<T> {
  const logger = createLogger(`${controllerName}Controller`);

  return {
    createContent: async (req: RequestWithUser, res: Response): Promise<Response<T>> => {
      try {
        checkVoidUser(req.user, controllerName, 'create');
        checkVoidPayload(req.body, controllerName, 'create');

        const content = await manager.createContent(req.body);

        logger.info('Content created');

        return res.send(content);
      } catch (error) {
        logger.error(error);

        return errorHandler(error as Error, res);
      }
    },
    updateContent: async (
      req: RequestWithUser,
      res: Response,
    ): Promise<Response<T>> => {
      try {
        const { id: contentId } = req.params;
        const { user } = req;
        const updateProperties = req.body;

        checkVoidUser(user, controllerName, 'update');
        checkVoidPayload(updateProperties, controllerName, 'update');

        const content = await manager.updateContent(
          contentId,
          updateProperties,
          user!.id!,
          user!.role === 'admin',
        );

        logger.info('Content updated');

        return res.send(content);
      } catch (error) {
        logger.error(error);

        return errorHandler(error as Error, res);
      }
    },
    deleteContent: async (
      req: RequestWithUser,
      res: Response,
    ): Promise<Response<T>> => {
      try {
        const { id: contentId } = req.params;
        const { user } = req;

        checkVoidUser(user, controllerName, 'delete');

        if (!contentId) {
          throw new Error('Content id is required for deleting action');
        }

        const content = await manager.deleteContent(
          contentId,
          user!.id!,
          user!.role === 'admin',
        );

        logger.info('Content deleted');

        return res.send(content);
      } catch (error) {
        logger.error(error);

        return errorHandler(error as Error, res);
      }
    },
    listContent: async (
      req: RequestWithUser,
      res: Response,
    ): Promise<Response<T>> => {
      try {
        checkVoidUser(req.user, controllerName, 'list');

        const content = await manager.listContent(req.user!.id!);

        logger.info(`Listed ${content.length} content(s) for user: ${req.user?.id}`);

        return res.send(content);
      } catch (error) {
        logger.error(error);

        return errorHandler(error as Error, res);
      }
    },
    getContent: async (
      req: RequestWithUser,
      res: Response,
    ): Promise<Response<T>> => {
      try {
        const { id: contentId } = req.params;
        const { user } = req;

        checkVoidUser(user, controllerName, 'get');

        if (!contentId) {
          throw new Error('Content id is required for getting action');
        }

        const content = await manager.getContent(contentId, user!.id!, user!.role === 'admin');

        logger.info(`Content retrieved: ${contentId}`);

        return res.send(content);
      } catch (error) {
        logger.error(error);

        return errorHandler(error as Error, res);
      }
    },
  };
}
