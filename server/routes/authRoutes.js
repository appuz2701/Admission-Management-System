const express = require('express');
const { register, login, getProfile, getAllUsers } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

router.post('/register', protect, authorize('admin'), register);
router.post('/login', login);
router.get('/profile', protect, getProfile);
router.get('/users', protect, authorize('admin'), getAllUsers);

module.exports = router;