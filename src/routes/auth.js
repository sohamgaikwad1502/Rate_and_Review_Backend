const express = require('express');
const router = express.Router();

const {
    signup,
    login,
    getProfile,
    changePassword
} = require('../controllers/authController');

const { authenticateToken } = require('../middleware/auth');
const {
    validateSignup,
    validateLogin,
    validatePasswordChange
} = require('../middleware/validation');

router.post('/signup', validateSignup, signup);
router.post('/login', validateLogin, login);
router.get('/profile', authenticateToken, getProfile);
router.put('/change-password', authenticateToken, validatePasswordChange, changePassword);

module.exports = router;