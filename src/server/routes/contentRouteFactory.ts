import { Router } from 'express';
import { createAccessTokenValidation } from '../utils/authorization';
import type { IContentController } from '../types';

export default function contentRouterFactory(controller: IContentController, urlPrefix: string) {
  const router = Router();

  router.get('/', createAccessTokenValidation(), controller.listContent.bind(controller));
  router.post('/', createAccessTokenValidation(), controller.createContent.bind(controller));
  router.get('/:id([0-9a-fA-F]{24})', createAccessTokenValidation(), controller.getContent.bind(controller));
  router.put('/:id([0-9a-fA-F]{24})', createAccessTokenValidation(), controller.updateContent.bind(controller));
  router.delete('/:id([0-9a-fA-F]{24})', createAccessTokenValidation(), controller.deleteContent.bind(controller));

  return {
    urlPrefix,
    router,
  };
}