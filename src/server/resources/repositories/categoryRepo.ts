import Repository from './repository';
import CategoryModel, { ICategoryDocument } from '../models/categoryModel';
import { ICategory } from '../../types';

export default new Repository<ICategoryDocument, ICategory>(CategoryModel);
