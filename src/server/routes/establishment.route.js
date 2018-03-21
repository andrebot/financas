const { Router } = require('express');
const establishmentController = require('../controllers/establishment.controller');
const router = new Router();

router.route('/')
  .get(establishmentController.listAll)
  .put(establishmentController.create)
  .post(establishmentController.create);

router.route('/:id')
  .get(establishmentController.getById)
  .delete(establishmentController.remove);

module.exports = router;
