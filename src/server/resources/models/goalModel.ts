import { Schema, model } from 'mongoose';
import type { IGoalDocument } from '../../types';
import { transformMongooseObject } from '../../utils/misc';

const GoalSchema = new Schema<IGoalDocument>({
  name: { type: String, required: true },
  value: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  archived: { type: Boolean, default: false },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, {
  toObject: {
    transform: transformMongooseObject,
  },
  toJSON: {
    transform: transformMongooseObject,
  },
});

export default model<IGoalDocument>('Goal', GoalSchema);
