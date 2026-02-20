import { Schema, model } from 'mongoose';
import type { ICategoryDocument } from '../../types';
import { transformMongooseObject } from '../../utils/misc';

const CategorySchema = new Schema<ICategoryDocument>({
  name: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  parentCategory: { type: Schema.Types.ObjectId, ref: 'Category' },
}, {
  toObject: {
    transform: transformMongooseObject,
  },
  toJSON: {
    transform: transformMongooseObject,
  },
});

export default model<ICategoryDocument>('Category', CategorySchema);
