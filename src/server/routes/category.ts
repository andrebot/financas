import contentRouteFactory from './contentRouteFactory';
import CategoryController from '../controllers/categoryController';

const router = contentRouteFactory(CategoryController, {
  deleteContent: CategoryController.deleteContent.bind(CategoryController),
});

export default router;
