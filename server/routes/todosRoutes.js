const express = require('express');
const router = express.Router();
const todosController = require('../controllers/todosController');

router.get('/', todosController.getAll);
router.post('/', todosController.create);
router.put('/:id', todosController.update);
router.delete('/:id', todosController.delete);

module.exports = router;
