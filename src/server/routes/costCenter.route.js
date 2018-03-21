const { Router } = require('express');
const costCenterController = require('../controllers/costCenter.controller');
const router = new Router();

router.route('/')
  .get(costCenterController.listAll)
  .put(costCenterController.create)
  .post(costCenterController.create);

router.route('/:id')
  .get(costCenterController.getById)
  .delete(costCenterController.remove);

module.exports = router;
