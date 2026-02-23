import CategoryModel from '../models/categoryModel';
import Repository from './repository';
import type { ICategoryDocument, ICategory, ICategoryRepo } from '../../types';

export class CategoryRepo extends Repository<ICategoryDocument, ICategory>
  implements ICategoryRepo {
  constructor(categoryModel: typeof CategoryModel = CategoryModel) {
    super(categoryModel);
  }

  /**
   * Finds all subcategories of a parent category.
   *
   * @param parentCategoryId - The id of the parent category.
   * @returns The subcategories.
   */
  async findAllSubcategories(parentCategoryId: string): Promise<ICategory[]> {
    return this.Model.find({ parentCategory: parentCategoryId });
  }

  /**
   * Deletes all subcategories of a parent category.
   *
   * @param parentCategoryId - The id of the parent category.
   * @returns The number of deleted subcategories.
   */
  async deleteAllSubcategories(parentCategoryId: string): Promise<number> {
    this.logger.info(`Deleting all subcategories of parent category: ${parentCategoryId}`);

    const result = await this.Model.deleteMany({ parentCategory: parentCategoryId });

    return result.deletedCount;
  }
}

export default new CategoryRepo();
