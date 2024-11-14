import { Response } from 'express';
import { Model, Document } from 'mongoose';
import {
  createContent,
  updateContent,
  deleteContent,
  listContent,
  getContent,
} from '../managers/contentManager';
import { handleError } from '../utils/responseHandlers';
import type{ RequestWithUser, IContentController, UserPayload } from '../types';

/**
 * Checks if the payload is void.
 *
 * @param payload - The payload to check
 * @param modelName - The name of the model
 * @throws {Error} - If the payload is void
 */
function checkVoidPayload(payload: Record<string, unknown>, modelName: string, action: string): void {
  if (!payload || Object.keys(payload).length === 0) {
    throw new Error(`No information provided to ${action} ${modelName}`);
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
async function updatePayload<T extends Document>(
  req: RequestWithUser,
  res: Response,
  model: Model<T>,
  contentId: string,
): Promise<Response<T>> {
  const {
    id: userId,
    role,
  } = req.user as UserPayload;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  const content = await updateContent<T>(
    contentId,
    req.body,
    model,
    userId,
    role === 'admin',
  );

  return res.send(content);
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
async function deleteContentPayload<T extends Document>(
  req: RequestWithUser,
  res: Response,
  model: Model<T>,
  contentId: string,
): Promise<Response<T>> {
  const {
    id: userId,
    role,
  } = req.user as UserPayload;

  if (!userId) {
    throw new Error('User not authenticated');
  }

  const content = await deleteContent<T>(
    contentId,
    model,
    userId,
    role === 'admin',
  );

  return res.send(content);
}

/**
 * Handles the content error.
 *
 * @param error - The error to handle
 * @param res - The response object
 * @throws {Error} - If the error is not allowed to update
 */
function handleContentError(
  error: Error,
  res: Response,
) {
  let status = 500;

  if ((error as Error).message.includes('is not allowed')) {
    status = 403;
  }

  return handleError(error as Error, res, status);
}

/**
 * Creates the content controller.
 *
 * @param model - The model to create the content from
 * @returns The content controller
 */
export default function contentControllerFactory<T extends Document>(
  model: Model<T>,
): IContentController {
  return {
    async createContent(req: RequestWithUser, res: Response) {
      try {
        checkVoidPayload(req.body, model.modelName, 'create');
        const content = await createContent<T>(req.body, model);

        return res.send(content);
      } catch (error) {
        return handleError(error as Error, res);
      }
    },

    async updateContent(req: RequestWithUser, res: Response) {
      try {
        const { id: contentId } = req.params;

        checkVoidPayload(req.body, model.modelName, 'update');

        if (req.user && req.user.id) {
          return await updatePayload<T>(req, res, model, contentId);
        }

        throw new Error('User not authenticated');
      } catch (error) {
        return handleContentError(error as Error, res);
      }
    },

    async deleteContent(req: RequestWithUser, res: Response) {
      try {
        const { id: contentId } = req.params;

        if (req.user && req.user.id) {
          return await deleteContentPayload<T>(req, res, model, contentId);
        }

        throw new Error('User not authenticated');
      } catch (error) {
        return handleContentError(error as Error, res);
      }
    },

    async listContent(req: RequestWithUser, res: Response) {
      try {
        const content = await listContent<T>(req.body, model, req.user?.id);

        return res.send(content);
      } catch (error) {
        return handleError(error as Error, res);
      }
    },

    async getContent(req: RequestWithUser, res: Response) {
      try {
        const { id: contentId } = req.params;

        const content = await getContent<T>(contentId, model, req.user?.id);

        return res.send(content);
      } catch (error) {
        return handleError(error as Error, res);
      }
    },
  };
}
