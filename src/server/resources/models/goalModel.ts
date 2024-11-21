import {
  Schema,
  model,
  Document,
  ObjectId,
} from 'mongoose';
import { IGoal } from '../../types';

export interface IGoalDocument extends Omit<IGoal, 'id' | 'user'>, Document {
  user: ObjectId;
}

const GoalSchema = new Schema<IGoalDocument>({
  name: { type: String, required: true },
  value: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

export default model<IGoalDocument>('Goal', GoalSchema);
