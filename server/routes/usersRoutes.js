const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');

router.get('/', usersController.getAll);
router.post('/', usersController.create); // Optional admin creation
router.put('/:id', usersController.update);
router.delete('/:id', usersController.delete);

module.exports = router;
