const { Router } = require('express');
const transactionController = require('../controllers/transaction.controller');
const router = new Router();

router.route('/')
  .get(transactionController.listAll)
  .put(transactionController.create)
  .post(transactionController.create);

router.route('/:id')
  .get(transactionController.getById)
  .delete(transactionController.remove);

module.exports = router;
