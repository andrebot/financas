import { Router } from 'express';
import createTokenValidation from '../utils/authorization';
import { IContentController } from '../types';

export default function contentRouterFactory(controller: IContentController, urlPrefix: string) {
  const router = Router();

  router.get('/', createTokenValidation(), controller.listContent);
  router.post('/', createTokenValidation(), controller.createContent);
  router.get('/:id([0-9a-fA-F]{24})', createTokenValidation(), controller.getContent);
  router.put('/:id([0-9a-fA-F]{24})', createTokenValidation(), controller.updateContent);
  router.delete('/:id([0-9a-fA-F]{24})', createTokenValidation(), controller.deleteContent);

  return {
    urlPrefix,
    router,
  };
}