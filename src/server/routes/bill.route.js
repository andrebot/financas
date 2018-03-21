const { Router } = require('express');
const billController = require('../controllers/bill.controller');
const router = new Router();

router.route('/')
  .get(billController.listAll)
  .put(billController.create)
  .post(billController.create);

router.route('/:id')
  .get(billController.getById)
  .delete(billController.remove);

module.exports = router;
