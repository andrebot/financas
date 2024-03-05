import {
  Schema,
  model,
  Document,
  Types,
} from 'mongoose';

export interface IGoal extends Document {
  /**
   * Name of the Goal
   */
  name: string;
  /**
   * Goal's target value
   */
  value: number;
  /**
   * Due date for the goal
   */
  dueDate: Date;
  /**
   * Goal owner
   */
  user: Types.ObjectId;
}

const GoalSchema = new Schema<IGoal>({
  name: { type: String, required: true },
  value: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
});

export default model<IGoal>('Goal', GoalSchema);
