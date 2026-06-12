const express = require('express');
const router = express.Router();
const albumsController = require('../controllers/albumsController');

router.get('/', albumsController.getAll);
router.post('/', albumsController.create);
router.put('/:id', albumsController.update);
router.delete('/:id', albumsController.delete);

module.exports = router;
