import type { Response } from 'express';
import ContentController from './contentController';
import { checkVoidUser } from '../utils/misc';
import type { RequestWithUser, ICategory } from '../types';
import CategoryManager from '../managers/categoryManager';

export class CategoryController extends ContentController<ICategory> {
  private categoryManager: typeof CategoryManager;

  constructor(categoryManager: typeof CategoryManager = CategoryManager) {
    super(categoryManager, 'CategoryController');

    this.categoryManager = categoryManager;
  }

  async deleteContent(
    req: RequestWithUser,
    res: Response,
  ): Promise<Response<ICategory | null>> {
    try {
      const { id: contentId } = req.params;
      const { user } = req;

      checkVoidUser(user, this.manager.modelName, 'delete');

      if (!contentId) {
        throw new Error('Content id is required for deleting action');
      }

      const content = await this.categoryManager.deleteCategory(
        contentId,
        user!.id!,
        user!.role === 'admin',
      );

      this.logger.info('Category deleted');

      return res.send(content);
    } catch (error) {
      this.logger.error(error);

      return this.errorHandler(error as Error, res);
    }
  }
}

export default new CategoryController();
