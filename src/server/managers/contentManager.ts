import { Model, Document } from 'mongoose';

/**
 * Save content to the database
 * 
 * @throws {Error} - If no content is provided
 * @throws {Error} - If the content cannot be saved
 *
 * @param content - The content to save
 * @param model - The model to save the content to
 * @returns The saved content
 */
export async function saveContent<T extends Document>(
  content: Record<string, any>,
  model: Model<T>,
): Promise<Record<string, any>> {
  const instance = new model(content);

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
 * @param model - The model to update the content in
 * @param userId - The id of the user updating the content
 * @param isAdmin - Whether the user is an admin
 * @returns The updated content
 */
export async function updateContent<T extends Document>(
  id: string,
  payload: Record<string, any>,
  model: Model<T>,
  userId: string,
  isAdmin: boolean = false,
): Promise<T> {
  if (!payload || Object.keys(payload).length === 0) {
    throw new Error(`No information provided to update ${model.modelName}`);
  }

  const instance = await model.findById(id) as T & { user: string };

  if (!instance) {
    throw new Error(`${model.modelName} not found with id ${id}`);
  }

  if (!isAdmin && instance.user.toString() !== userId) {
    throw new Error(`User ${userId} is not allowed to update ${model.modelName} with id ${id}`);
  }

  Object.keys(payload).forEach((key) => {
    instance[key as keyof typeof instance] = payload[key as keyof typeof payload];
  });

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
 * @param model - The model to delete the content from
 * @param userId - The id of the user deleting the content
 * @param isAdmin - Whether the user is an admin
 * @returns The deleted content
 */
export async function deleteContent<T extends Document>(
  id: string,
  model: Model<T>,
  userId: string,
  isAdmin: boolean = false,
): Promise<T> {
  const instance = await model.findById(id) as T & { user: string };

  if (!instance) {
    throw new Error(`${model.modelName} not found with id ${id}`);
  }

  if (!isAdmin && instance.user.toString() !== userId) {
    throw new Error(`User ${userId} is not allowed to delete ${model.modelName} with id ${id}`);
  }

  await model.findByIdAndDelete(id);

  return instance.toObject();
}

/**
 * List content from the database
 *
 * @throws {Error} - If the content cannot be listed
 * 
 * @param query - The query to use to filter the content
 * @param model - The model to list the content from
 * @param userId - The id of the user listing the content
 * @returns The list of content
 */
export async function listContent<T extends Document>(
  query: Record<string, any>,
  model: Model<T>,
  userId?: string,
): Promise<T[]> {
  return model.find({
    ...query,
    user: userId,
  });
}

/**
 * Get content from the database
 *
 * @param id - The id of the content to get
 * @param model - The model to get the content from
 * @param userId - The id of the user getting the content
 * @returns The content
 */
export async function getContent<T extends Document>(
  id: string,
  model: Model<T>,
  userId?: string,
): Promise<T | null> {
  const instance = await model.findById(id) as T & { user: string };

  if (instance && userId && instance.user?.toString() === userId) {
    return instance;
  }

  return null;
}
