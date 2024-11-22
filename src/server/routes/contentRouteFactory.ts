import { Router } from 'express';
import createTokenValidation from '../utils/authorization';
import { IContentController } from '../types';

export default function contentRouterFactory(controller: IContentController, urlPrefix: string) {
  const router = Router();

  router.get('/', createTokenValidation(), controller.listContent.bind(controller));
  router.post('/', createTokenValidation(), controller.createContent.bind(controller));
  router.get('/:id([0-9a-fA-F]{24})', createTokenValidation(), controller.getContent.bind(controller));
  router.put('/:id([0-9a-fA-F]{24})', createTokenValidation(), controller.updateContent.bind(controller));
  router.delete('/:id([0-9a-fA-F]{24})', createTokenValidation(), controller.deleteContent.bind(controller));

  return {
    urlPrefix,
    router,
  };
}