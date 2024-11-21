import ContentManager from './contentManager';
import categoryRepo from '../resources/repositories/categoryRepo';
import type { ICategory } from '../types';

export default new ContentManager<ICategory>(categoryRepo);