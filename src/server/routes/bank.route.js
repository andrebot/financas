const { Router } = require('express');
const bankController = require('../controllers/bank.controller');
const router = new Router();

router.route('/')
  .get(bankController.listAll)
  .put(bankController.create)
  .post(bankController.create);

router.route('/:id')
  .get(bankController.getById)
  .delete(bankController.remove);

module.exports = router;
