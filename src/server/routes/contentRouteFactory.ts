import { Router } from 'express';
import { Model, Document } from 'mongoose';
import contentControllerFactory from '../controllers/contentFactory';
import createTokenValidation from '../utils/authorization';

export default function contentRouteFactory<T extends Document>(
  model: Model<T>,
  urlPrefix: string,
) {
  const router = Router();
  const contentController = contentControllerFactory(model);

  router.get('/', createTokenValidation(), contentController.listContent);
  router.post('/', createTokenValidation(), contentController.createContent);
  router.get('/:id([0-9a-fA-F]{24})', createTokenValidation(), contentController.getContent);
  router.put('/:id([0-9a-fA-F]{24})', createTokenValidation(), contentController.updateContent);
  router.delete('/:id([0-9a-fA-F]{24})', createTokenValidation(), contentController.deleteContent);

  return {
    urlPrefix,
    router,
  };
}
