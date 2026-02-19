import routeFactory from './routeFactory';
import TransactionController from '../controllers/transactionController';
import createAccessTokenValidation from '../utils/authorization';

const router = routeFactory(TransactionController);

router.get('/types', createAccessTokenValidation(), TransactionController.getTransactionTypes);

export default router;
