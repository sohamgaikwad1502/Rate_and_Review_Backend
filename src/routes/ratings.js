const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../middleware/auth');
const { 
    validateRatingSubmission, 
    validateRatingUpdate 
} = require('../middleware/validation');

const {
    submitRating,
    getStoreRatings,
    getMyRatings,
    updateMyRating,
    deleteMyRating,
    getRatingById
} = require('../controllers/ratingController');

router.get('/my-ratings', authenticateToken, getMyRatings);
router.get('/store/:storeId', getStoreRatings);
router.get('/:id', getRatingById);
router.post('/submit', authenticateToken, validateRatingSubmission, submitRating);
router.put('/:id', authenticateToken, validateRatingUpdate, updateMyRating);
router.delete('/:id', authenticateToken, deleteMyRating);

module.exports = router;