const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../middleware/auth');
const { requireAdmin } = require('../middleware/roleAuth');
const { 
    validateUserCreation,
    validateStoreCreation
} = require('../middleware/validation');

const {
    getDashboardStats,
    createUser,
    getAllUsers,
    getAllStoresAdmin,
    getUserDetails,
    createStore
} = require('../controllers/adminController');

router.get('/dashboard', authenticateToken, requireAdmin, getDashboardStats);
router.post('/users/create', authenticateToken, requireAdmin, validateUserCreation, createUser);
router.get('/users', authenticateToken, requireAdmin, getAllUsers);
router.get('/users/:id', authenticateToken, requireAdmin, getUserDetails);
router.post('/stores/create', authenticateToken, requireAdmin, validateStoreCreation, createStore);
router.get('/stores', authenticateToken, requireAdmin, getAllStoresAdmin);

module.exports = router;