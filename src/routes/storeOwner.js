const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../middleware/auth');
const { requireStoreOwner } = require('../middleware/roleAuth');

const {
    getMyStoreDashboard,
    getUsersWhoRatedMyStores,
    getMyStoreRatingStats
} = require('../controllers/storeOwnerController');


router.get('/dashboard', authenticateToken, requireStoreOwner, getMyStoreDashboard);
router.get('/ratings/users', authenticateToken, requireStoreOwner, getUsersWhoRatedMyStores);
router.get('/ratings/users/:storeId', authenticateToken, requireStoreOwner, getUsersWhoRatedMyStores);
router.get('/store/:storeId/stats', authenticateToken, requireStoreOwner, getMyStoreRatingStats);

module.exports = router;