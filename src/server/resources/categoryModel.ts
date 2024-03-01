import {
  Schema,
  model,
  Document,
  Types,
} from 'mongoose';

export interface ICategory extends Document {
  /**
   * Name of the category
   */
  name: string;
  /**
   * Category owner
   */
  user: Types.ObjectId;
  /**
   * Parent category, if this is a sub-category
   */
  parentCategory?: Types.ObjectId;
};

const CategorySchema = new Schema<ICategory>({
  name: {
    type: String,
    required: true,
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  parentCategory: {
    type: Schema.Types.ObjectId,
    ref: 'Category',
  },
});

export default model<ICategory>('Category', CategorySchema);
