import contentRouteFactory from './contentRouteFactory';
import GoalModel, { IGoal } from '../resources/goalModel';

export default contentRouteFactory<IGoal>(GoalModel, 'goal');
