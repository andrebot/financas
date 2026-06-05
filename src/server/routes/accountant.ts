import routeFactory from './routeFactory';
import AccountantController from '../controllers/accountantController';
import createAccessTokenValidation from '../utils/authorization';

const router = routeFactory(AccountantController);

router.get('/types', createAccessTokenValidation(), AccountantController.getTransactionTypes);

export default router;
