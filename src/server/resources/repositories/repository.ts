import { Model, FilterQuery, Document } from 'mongoose';
import { IRepository } from './IRepository';
import { QueryFilter, QueryCondition } from './query';
import { removeEmptyProperties, isObjectEmptyOrNull } from '../../utils/misc';

/**
 * Map of query operators to MongoDB operators.
 *
 * @remarks 
 * This map is used to translate query conditions to MongoDB operators.
 * We have mapped the following query conditions:
 * - equals: `$eq`
 * - not: `$ne`
 * - in: `$in`
 * - notIn: `$nin`
 * - lt: `$lt`
 * - lte: `$lte`
 * - gt: `$gt`
 * - gte: `$gte`
 */
const operatorMap: Record<string, string> = {
  equals: '$eq',
  not: '$ne',
  in: '$in',
  notIn: '$nin',
  lt: '$lt',
  lte: '$lte',
  gt: '$gt',
  gte: '$gte',
};

export class Repository<T extends Document, K> implements IRepository<T, K> {
  private model: Model<T>;
  modelName: string;

  constructor(model: Model<T>) {
    this.model = model;
    this.modelName = model.modelName;
  }

  private isQueryCondition(value: any): value is QueryCondition<any> {
    return typeof value === 'object' && value !== null && !(value instanceof Array);
  }

  private translate(key: string, value: any, translatedCondition: any) {
    if (key in operatorMap) {
      translatedCondition[operatorMap[key]] = value;
    } else if (key === 'contains' && value !== undefined) {
      translatedCondition.$regex = new RegExp(String(value), 'i');
    } else if (key === 'startsWith' && value !== undefined) {
      translatedCondition.$regex = new RegExp(`^${String(value)}`, 'i');
    } else if (key === 'endsWith' && value !== undefined) {
      translatedCondition.$regex = new RegExp(`${String(value)}$`, 'i');
    }
  }

  private translateCondition(condition: QueryCondition<any>): any {
    const translatedCondition: any = {};

    for (const [key, value] of Object.entries(condition)) {
      this.translate(key, value, translatedCondition);
    }

    return translatedCondition;
  }

  private translateFilter(query: QueryFilter<K>): FilterQuery<T> {
    const translatedQuery: FilterQuery<K> = {};

    for (const key in query) {
      const value = query[key];

      if (this.isQueryCondition(value)) {
        translatedQuery[key] = this.translateCondition(value);
      } else {
        translatedQuery[key] = value as FilterQuery<K>[Extract<keyof K, string>];
      }
    }

    return removeEmptyProperties(translatedQuery) || {};
  }

  findById(id: string): Promise<K | null> {
    return this.model.findById(id);
  }

  findByIdAndDelete(id: string): Promise<K | null> {
    return this.model.findByIdAndDelete(id).lean();
  }

  find(query: QueryFilter<K> = {}): Promise<K[]> {
    return this.model.find(this.translateFilter(query)).lean();
  }

  findOne(query: QueryFilter<K>): Promise<K | null> {
    if (isObjectEmptyOrNull(query)) {
      throw new Error('Cannot search for one instance with empty query');
    }

    return this.model.findOne(this.translateFilter(query)).lean();
  }

  save(entity?: K): Promise<K> {
    const instance = new this.model(entity);

    return instance.save().then((instance) => instance.toObject());
  }

  update(id: string, entity: Partial<K>): Promise<K | null> {
    return this.model.findByIdAndUpdate(id, entity as any, { new: true }).lean();
  }
}
