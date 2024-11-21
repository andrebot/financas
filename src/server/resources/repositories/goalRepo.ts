import { Repository } from './repository';
import GoalModel, { IGoalDocument } from '../models/goalModel';
import { IGoal } from '../../types';

export default new Repository<IGoalDocument, IGoal>(GoalModel);
