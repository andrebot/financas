import ContentManager from './contentManager';
import goalRepo from '../resources/repositories/goalRepo';
import type { IGoal } from '../types';

export default new ContentManager<IGoal>(goalRepo);
