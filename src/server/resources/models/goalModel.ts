import { Schema, model } from 'mongoose';
import type { IGoalDocument } from '../../types';

const GoalSchema = new Schema<IGoalDocument>({
  name: { type: String, required: true },
  value: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

export default model<IGoalDocument>('Goal', GoalSchema);
