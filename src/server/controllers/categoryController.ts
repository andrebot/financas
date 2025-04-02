import ContentController from './contentController';
import CategoryManager from '../managers/categoryManager';

import type { ICategory } from '../types';

export default new ContentController<ICategory>(CategoryManager, 'CategoryController');
