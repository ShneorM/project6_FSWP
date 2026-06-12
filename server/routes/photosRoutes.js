const express = require('express');
const router = express.Router();
const photosController = require('../controllers/photosController');

router.get('/', photosController.getAll);
router.post('/', photosController.create);
router.put('/:id', photosController.update);
router.delete('/:id', photosController.delete);

module.exports = router;
