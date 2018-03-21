const { Router } = require('express');
const userController = require('../controllers/user.controller');
const router = new Router();

router.route('/')
  .get(userController.listAll)
  .put(userController.create)
  .post(userController.create);

router.route('/:id')
  .get(userController.getById)
  .delete(userController.remove);

module.exports = router;
