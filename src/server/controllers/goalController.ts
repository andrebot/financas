import ContentController from './contentController';
import GoalManager from '../managers/goalManager';

import type { IGoal } from '../types';

export default new ContentController<IGoal>(GoalManager, 'GoalController');
