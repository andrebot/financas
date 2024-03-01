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
import { RequestWithUser } from '../types';

export interface IContentController {
  /**
   * Create content.
   *
   * @param req - The request object
   * @param res - The response object
   * @returns The created content
   */
  createContent(req: RequestWithUser, res: Response): Promise<Response>;
  /**
   * Update content. If the user is an admin, they can update any content.
   *
   * @param req - The request object
   * @param res - The response object
   * @returns The updated content
   */
  updateContent(req: RequestWithUser, res: Response): Promise<Response>;
  /**
   * Delete content by id. If the user is an admin, they can delete any content.
   * If the user is not an admin, they can only delete their own content.
   *
   * @param req - The request object
   * @param res - The response object
   * @returns The deleted content
   */
  deleteContent(req: RequestWithUser, res: Response): Promise<Response>;
  /**
   * List user content. If the user is an admin, they can list all content.
   *
   * @param req - The request object
   * @param res - The response object
   * @returns The list of content
   */
  listContent(req: RequestWithUser, res: Response): Promise<Response>;
  /**
   * Get content by id. If the user is an admin, they can get any content.
   *
   * @param req - The request object
   * @param res - The response object
   * @returns The content
   */
  getContent(req: RequestWithUser, res: Response): Promise<Response>;
}

export default function contentControllerFactory<T extends Document>(
  model: Model<T>,
): IContentController {
  return {
    async createContent(req: RequestWithUser, res: Response) {
      try {
        const content = await createContent<T>(req.body, model);

        return res.send(content);
      } catch (error) {
        return handleError(error as Error, res);
      }
    },

    async updateContent(req: RequestWithUser, res: Response) {
      try {
        const { id: contentId } = req.params;

        if (!req.body || Object.keys(req.body).length === 0) {
          return handleError(
            new Error(`No information provided to update ${model.modelName}`),
            res,
          );
        }
        
        if (req.user && req.user.id) {
          const {
            id: userId,
            role,
          } = req.user;

          const content = await updateContent<T>(
            contentId,
            req.body,
            model,
            userId,
            role === 'admin',
          );
      
          return res.send(content);
        }

        throw new Error('User not authenticated');
      } catch (error) {
        let status = 500;

        if ((error as Error).message.includes('is not allowed to update')) {
          status = 403;
        }

        return handleError(error as Error, res, status);
      }
    },

    async deleteContent(req: RequestWithUser, res: Response) {
      try {
        const { id: contentId } = req.params;

        if (req.user && req.user.id) {
          const {
            id: userId,
            role,
          } = req.user;

          const content = await deleteContent<T>(
            contentId,
            model,
            userId,
            role === 'admin',
          );
      
          return res.send(content);
        }

        throw new Error('User not authenticated');
      } catch (error) {
        let status = 500;

        if ((error as Error).message.includes('is not allowed to delete')) {
          status = 403;
        }

        return handleError(error as Error, res, status);
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
};
