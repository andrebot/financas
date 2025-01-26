import {
  Schema,
  model,
  Document,
  ObjectId,
  Types,
} from 'mongoose';
import { ICategory } from '../../types';

export interface ICategoryDocument extends Omit<ICategory, 'id' | 'user' | 'parentCategory'>, Document {
  _id: Types.ObjectId;
  user: ObjectId;
  parentCategory: ObjectId;
}

const CategorySchema = new Schema<ICategoryDocument>({
  name: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  parentCategory: { type: Schema.Types.ObjectId, ref: 'Category' },
});

export default model<ICategoryDocument>('Category', CategorySchema);
