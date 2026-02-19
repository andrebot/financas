import { Router } from "express";
import { Content } from "../types";
import createAccessTokenValidation from "../utils/authorization";
import type { ICommonController } from "../types";

/**
 * Factory for creating routes for a given common controller. This is used
 * to create generic routes (CRUD) for all content types.
 *
 * @param commonController - The common controller to use.
 * @returns The new route factory.
 */
export default function newRouteFactory<T extends Content>(commonController: ICommonController<T>) {
  const router = Router();

  router.get('/', createAccessTokenValidation(), commonController.listContent);
  router.post('/', createAccessTokenValidation(), commonController.createContent);
  router.get('/:id([0-9a-fA-F]{24})', createAccessTokenValidation(), commonController.getContent);
  router.put('/:id([0-9a-fA-F]{24})', createAccessTokenValidation(), commonController.updateContent);
  router.delete('/:id([0-9a-fA-F]{24})', createAccessTokenValidation(), commonController.deleteContent);

  return router;
}
