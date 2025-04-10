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
  resetPasswordController,
  changePasswordController,
  registerController,
} from '../controllers/authorization';
import createAccessTokenValidation from '../utils/authorization';

const router = express.Router();

router.post('/', createAccessTokenValidation(true), createUserController);
router.get('/', createAccessTokenValidation(true), listUsersController);
router.post('/register', registerController);
router.post('/login', loginController);
router.post('/logout', logoutController);
router.get('/refresh-tokens', refreshTokensController);
router.get('/:userId', createAccessTokenValidation(), getUserController);
router.put('/:userId', createAccessTokenValidation(), updateUserController);
router.delete('/:userId', createAccessTokenValidation(), deleteUserController);
router.post('/reset-password', resetPasswordController);
router.post('/change-password', createAccessTokenValidation(), changePasswordController);

export default router;
