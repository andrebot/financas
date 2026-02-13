import ContentManager from './contentManager';
import TransactionRepo from '../resources/repositories/transactionRepo';
import CategoryRepo from '../resources/repositories/categoryRepo';
import { checkVoidInstance } from '../utils/misc';
import type { ICategory } from '../types';

/**
 * Manager for the Category model. It extends the ContentManager class
 * by adding the ability to delete a category and all its subcategories.
 */
export class CategoryManager extends ContentManager<ICategory> {
  private transactionRepo: typeof TransactionRepo;

  private categoryRepo: typeof CategoryRepo;

  constructor(
    categoryRepo: typeof CategoryRepo = CategoryRepo,
    transactionRepo: typeof TransactionRepo = TransactionRepo,
  ) {
    super(categoryRepo, 'CategoryManager');

    this.transactionRepo = transactionRepo;
    this.categoryRepo = categoryRepo;
  }

  /**
   * Deletes a category and all its subcategories. It also
   * removes the category from all transactions.
   *
   * @throws {Error} - If the category id is not provided.
   * @throws {Error} - If the user is not allowed to delete the category.
   * @throws {Error} - If the database throws an error.
   * @param id - The id of the category to delete.
   * @returns True if the category was deleted, false otherwise.
   */
  async deleteCategory(id: string, userId: string, isAdmin: boolean): Promise<ICategory | null> {
    if (!id) {
      throw new Error('Category id is required for deleting action');
    }

    const instance = await this.repository.findById(id);

    checkVoidInstance(instance, this.repository.modelName, id);
    this.checkUserAccess(instance!.user.toString(), userId, isAdmin, this.repository.modelName, id, 'delete');

    this.logger.info(`Deleting category and all its subcategories with id: ${id}`);

    const subcategories = await this.categoryRepo.findAllSubcategories(id);

    this.logger.info(`Found ${subcategories.length} subcategories`);

    const updatedTransactions = await this.transactionRepo.removeCategoriesFromTransactions(
      [id, ...subcategories.map((s) => s.id!)],
    );

    this.logger.info(`Removed categories from ${updatedTransactions} transactions`);

    if (subcategories.length > 0) {
      const deletedCount = await this.categoryRepo.deleteAllSubcategories(id);

      this.logger.info(`Deleted ${deletedCount} subcategories`);
    }

    return this.repository.findByIdAndDelete(id);
  }
}

export default new CategoryManager();
