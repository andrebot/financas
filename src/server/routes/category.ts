import contentRouteFactory from './contentRouteFactory';
import categoryModel, { ICategory } from '../resources/categoryModel';

export default contentRouteFactory<ICategory>(categoryModel, 'category');
