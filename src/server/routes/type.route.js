const { Router } = require('express');
const typeController = require('../controllers/type.controller');
const router = new Router();

router.route('/')
  .get(typeController.listAll)
  .put(typeController.create)
  .post(typeController.create);

router.route('/:id')
  .get(typeController.getById)
  .delete(typeController.remove);

module.exports = router;
