import { Model, Document } from 'mongoose';
import { createLogger } from '../../utils/logger';
import { IRepository } from './IRepository';
import type { Logger } from 'winston';
import type { ErrorHandler } from '../../types';

/**
 * Default error handler. Just returns the error.
 *
 * @param error - The error to handle.
 * @returns The error.
 */
function defaultErrorHandler(error: Error): Error {
  return error;
}

export default class Repository<T extends Document, K> implements IRepository<T, K> {
  protected Model: Model<T>;
  protected errorHandler: ErrorHandler;
  protected logger: Logger;

  modelName: string;

  constructor(model: Model<T>, errorHandler: ErrorHandler = defaultErrorHandler) {
    this.Model = model;
    this.modelName = model.modelName;
    this.errorHandler = errorHandler;
    this.logger = createLogger(`Repository:${this.modelName}`);
  }

  /**
   * Finds a document by id.
   *
   * @param id - The id of the document to find.
   * @returns The document.
   */
  async findById(id: string): Promise<K | null> {
    const doc = await this.Model.findById(id);

    return doc ? (doc.toObject() as K) : null;
  }

  /**
   * Finds a document by id and deletes it.
   *
   * @param id - The id of the document to delete.
   * @returns The deleted document.
   */
  async findByIdAndDelete(id: string): Promise<K | null> {
    const doc = await this.Model.findByIdAndDelete(id);

    return doc ? (doc.toObject() as K) : null;
  }

  /**
   * Finds all documents.
   *
   * @param userId - The id of the user to filter the documents by.
   * @returns The documents.
   */
  async listAll(userId?: string): Promise<K[]> {
    const docs = await this.Model.find({
      user: userId,
    });

    return docs.map((doc) => doc.toObject() as K);
  }

  /**
   * Saves a document.
   *
   * @param entity - The document to save.
   * @returns The saved document.
   */
  async save(entity?: K): Promise<K> {
    try {
      const instance = new this.Model(entity);

      const result = await instance.save();

      return result.toObject() as K;
    } catch (error) {
      this.logger.error(error);
      throw this.errorHandler(error as Error);
    }
  }

  /**
   * Updates a document by id.
   *
   * @param id - The id of the document to update.
   * @param entity - The document to update.
   * @returns The updated document.
   */
  async update(id: string, entity: Partial<K>): Promise<K | null> {
    const result = await this.Model.findByIdAndUpdate(
      id,
      entity as any,
      { new: true, runValidators: true },
    );

    return result ? (result.toObject() as K) : null;
  }
}
