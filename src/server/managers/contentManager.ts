import { Model, Document } from 'mongoose';
import { IBudget } from '../resources/budgetModel';

/**
 * Check if the payload is void
 *
 * @param content - The payload to check
 * @param modelName - The name of the model
 */
function checkVoidPayload(content: Record<string, unknown>, modelName: string): void {
  if (!content || Object.keys(content).length === 0) {
    throw new Error(`No information provided to update ${modelName}`);
  }
}

/**
 * Update the instance object with the payload
 *
 * @param payload - The payload to update the instance with
 * @param instance - The instance to update
 */
function updateInstanceObject(payload: Record<string, unknown>, instance: Document): void {
  Object.keys(payload).forEach((key) => {
    const value = payload[key as keyof typeof payload];

    instance[key as keyof typeof instance] = value as typeof instance[keyof typeof instance];
  });
}

/**
 * Check if the instance is void
 *
 * @param instance - The instance to check
 * @param modelName - The name of the model
 */
function checkVoidInstance(instance: Document, modelName: string): void {
  if (!instance) {
    throw new Error(`${modelName} not found`);
  }
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
function checkUserAccess(
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
export async function createContent<T extends Document>(
  content: Record<string, unknown>,
  ContentModel: Model<T>,
): Promise<Record<string, unknown>> {
  const instance = new ContentModel(content);

  await instance.save();

  return instance.toObject();
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
export async function updateContent<T extends Document>(
  id: string,
  payload: Record<string, unknown>,
  ContentModel: Model<T>,
  userId: string,
  isAdmin: boolean = false,
): Promise<T> {
  checkVoidPayload(payload, ContentModel.modelName);

  const instance = await ContentModel.findById(id) as T & { user: string };

  checkVoidInstance(instance, ContentModel.modelName);
  checkUserAccess(instance.user.toString(), userId, isAdmin, ContentModel.modelName, id, 'update');
  updateInstanceObject(payload, instance);

  await instance.save();

  return instance.toObject();
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
export async function deleteContent<T extends Document>(
  id: string,
  ContentModel: Model<T>,
  userId: string,
  isAdmin: boolean = false,
): Promise<T> {
  const instance = await ContentModel.findById(id) as T & { user: string };

  checkVoidInstance(instance, ContentModel.modelName);
  checkUserAccess(instance.user.toString(), userId, isAdmin, ContentModel.modelName, id, 'delete');

  await ContentModel.findByIdAndDelete(id);

  return instance.toObject();
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
export async function listContent<T extends Document>(
  query: Record<string, unknown> = {},
  ContentModel: Model<T>,
  userId?: string,
): Promise<T[]> {
  return ContentModel.find({
    ...query,
    user: userId,
  });
}

/**
 * Get content from the database
 *
 * @param id - The id of the content to get
 * @param ContentModel - The model to get the content from
 * @param userId - The id of the user getting the content
 * @returns The content
 */
export async function getContent<T extends Document>(
  id: string,
  ContentModel: Model<T>,
  userId?: string,
): Promise<T | null> {
  const instance = await ContentModel.findById(id) as T & { user: string };

  if (instance && userId && instance.user?.toString() === userId) {
    return instance;
  }

  return null;
}

/**
 * Get a budget from the database
 *
 * @param id - The id of the budget to get
 * @param userId - The id of the user getting the budget
 * @returns The budget
 */
export async function getBudget(
  id: string,
  ContentModel: Model<IBudget>,
  userId?: string,
): Promise<IBudget | null> {
  const budget = await getContent<IBudget>(id, ContentModel, userId);

  if (budget) {
    budget.spent = await budget.calculateSpent();
  }

  return budget;
}
