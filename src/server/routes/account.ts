import { Router } from 'express';
import contentControllerFactory from '../controllers/contentFactory';
import accountModel from '../resources/accountModel';
import createTokenValidation from '../utils/authorization';

const router = Router();
const contentController = contentControllerFactory(accountModel);

router.get('/', createTokenValidation(), contentController.listContent);
router.post('/', createTokenValidation(), contentController.createContent);
router.get('/:id', createTokenValidation(), contentController.getContent);
router.put('/:id', createTokenValidation(), contentController.updateContent);
router.delete('/:id', createTokenValidation(), contentController.deleteContent);

export default {
  urlPrefix: 'account',
  router,
};
