import express from 'express';
import {
  createUserController,
  updateUserController,
  listUsersController,
  deleteUserController,
  loginController,
  logoutController,
  refreshTokensController,
  getUserController,
} from '../controllers/authorization';
import createTokenValidation from '../utils/authorization';

const router = express.Router();

router.post('/', createTokenValidation(true), createUserController);
router.get('/', createTokenValidation(true), listUsersController);
router.post('/login', loginController);
router.post('/logout', createTokenValidation(), logoutController);
router.post('/refresh-tokens', refreshTokensController);
router.get('/:userId', createTokenValidation(), getUserController);
router.put('/:userId', createTokenValidation(), updateUserController);
router.delete('/:userId', createTokenValidation(true), deleteUserController);

export default {
  urlPrefix: 'user',
  router,
};
