const { Router } = require('express');
const creditCardController = require('../controllers/creditCard.controller');
const router = new Router();

router.route('/')
  .get(creditCardController.listAll)
  .put(creditCardController.create)
  .post(creditCardController.create);

router.route('/:id')
  .get(creditCardController.getById)
  .delete(creditCardController.remove);

module.exports = router;
