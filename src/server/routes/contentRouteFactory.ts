import { Router } from 'express';
import { Model, Document } from 'mongoose';
import ContentController from '../controllers/contentController';
import Repository from '../resources/repositories/repository';
import ContentManager, { Content } from '../managers/contentManager';
import createAccessTokenValidation from '../utils/authorization';
import type { IContentController, StandardRouteFactoryOptions } from '../types';

/**
 * Factory function to create standard CRUD routes for a given controller
 *
 * @param controller - The controller to create the router for
 * @returns The router and the url prefix
 */
export default function contentRouterFactory(controller: IContentController): Router {
  const router = Router();

  router.get('/', createAccessTokenValidation(), controller.listContent.bind(controller));
  router.post('/', createAccessTokenValidation(), controller.createContent.bind(controller));
  router.get('/:id([0-9a-fA-F]{24})', createAccessTokenValidation(), controller.getContent.bind(controller));
  router.put('/:id([0-9a-fA-F]{24})', createAccessTokenValidation(), controller.updateContent.bind(controller));
  router.delete('/:id([0-9a-fA-F]{24})', createAccessTokenValidation(), controller.deleteContent.bind(controller));

  return router;
}

/**
 * Factory function to create standard CRUD routes but with a custom repository
 * and content manager. If no repository or content manager is provided, the
 * default ones will be used with the content controller.
 *
 * @see {@link ContentController}
 * @see {@link ContentManager}
 * @see {@link Repository}
 *
 * @param model - The model to create the router for
 * @param prefix - The prefix to create the router for
 * @param options - The options to create the router for
 * @returns The router and the url prefix
 */
export function standardRouteFactory<T extends Document, K extends Content>(
  model: Model<T>,
  prefix: string,
  {
    contentManager,
    repository,
  }: StandardRouteFactoryOptions<T, K> = {},
): {
  prefix: string;
  controller: IContentController;
} {
  const repo = repository || new Repository<T, K>(model);
  const manager = contentManager || new ContentManager<K>(repo, model.modelName);
  const controller = new ContentController<K>(manager, `${model.modelName}Controller`);

  return {
    prefix,
    controller,
  };
}
