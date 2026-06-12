const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const adminMiddleware = require('../middleware/adminMiddleware');

// All admin routes are protected by adminMiddleware
router.get('/users', adminMiddleware, adminController.getAllUsersWithStats);
router.put('/users/:id/toggle-block', adminMiddleware, adminController.toggleBlockUser);

module.exports = router;
