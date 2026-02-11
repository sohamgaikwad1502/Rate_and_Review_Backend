const Rating = require('../models/Rating');
const Store = require('../models/Store');

const submitRating = async (req, res) => {
    try {
        const { store_id, rating, comment } = req.body;
        const userId = req.user.id; 
        
        const store = await Store.findStoreById(store_id);
        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'Store not found'
            });
        }
        
        const existingRating = await Rating.findExistingRating(userId, store_id);
        if (existingRating) {
            return res.status(409).json({
                success: false,
                message: 'You have already rated this store. Use update instead.',
                existing_rating: {
                    rating: existingRating.rating,
                    comment: existingRating.comment,
                    created_at: existingRating.created_at
                }
            });
        }
        
        const ratingData = {
            user_id: userId,
            store_id,
            rating,
            comment: comment || '' 
        };
        
        const newRating = await Rating.createRating(ratingData);
        
        const storeStats = await Rating.getAverageRating(store_id);
        
        res.status(201).json({
            success: true,
            message: 'Rating submitted successfully',
            data: {
                rating: {
                    id: newRating.id,
                    rating: newRating.rating,
                    comment: newRating.comment,
                    created_at: newRating.created_at
                },
                store_stats: storeStats
            }
        });
        
    } catch (error) {
        console.error('Error submitting rating:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error while submitting rating',
            ...(process.env.NODE_ENV === 'development' && { error: error.message })
        });
    }
};

const getStoreRatings = async (req, res) => {
    try {
        const { storeId } = req.params;
        
        const store = await Store.findStoreById(storeId);
        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'Store not found'
            });
        }
        
        const ratings = await Rating.getRatingsByStore(storeId);
        const storeStats = await Rating.getAverageRating(storeId);
        
        const formattedRatings = ratings.map(rating => ({
            id: rating.id,
            rating: rating.rating,
            comment: rating.comment,
            user_name: rating.user_name,
            created_at: rating.created_at,
            updated_at: rating.updated_at
        }));
        
        res.status(200).json({
            success: true,
            message: `Found ${ratings.length} ratings for ${store.name}`,
            data: {
                store_info: {
                    id: store.id,
                    name: store.name
                },
                statistics: storeStats,
                ratings: formattedRatings
            }
        });
        
    } catch (error) {
        console.error('Error fetching store ratings:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching store ratings'
        });
    }
};

const getMyRatings = async (req, res) => {
    try {
        const userId = req.user.id; 
        
        const ratings = await Rating.getRatingsByUser(userId);
   
        const formattedRatings = ratings.map(rating => ({
            id: rating.id,
            rating: rating.rating,
            comment: rating.comment,
            store_name: rating.store_name,
            store_id: rating.store_id,
            created_at: rating.created_at,
            updated_at: rating.updated_at
        }));

        res.status(200).json({
            success: true,
            message: `You have submitted ${ratings.length} ratings`,
            data: {
                ratings: formattedRatings,
                total: ratings.length
            }
        });
        
    } catch (error) {
        console.error('Error fetching user ratings:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching your ratings'
        });
    }
};

const updateMyRating = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, comment } = req.body;
        const userId = req.user.id;

        const existingRating = await Rating.findRatingById(id);
        if (!existingRating) {
            return res.status(404).json({
                success: false,
                message: 'Rating not found'
            });
        }
   
        if (existingRating.user_id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own ratings'
            });
        }
        
        const updateData = {
            rating,
            comment: comment || ''
        };
        
        const updatedRating = await Rating.updateRating(id, updateData);
        const storeStats = await Rating.getAverageRating(existingRating.store_id);

        res.status(200).json({
            success: true,
            message: 'Rating updated successfully',
            data: {
                rating: {
                    id: updatedRating.id,
                    rating: updatedRating.rating,
                    comment: updatedRating.comment,
                    updated_at: updatedRating.updated_at
                },
                store_stats: storeStats
            }
        });
        
    } catch (error) {
        console.error('Error updating rating:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error while updating rating'
        });
    }
};

const deleteMyRating = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        
        const existingRating = await Rating.findRatingById(id);
        if (!existingRating) {
            return res.status(404).json({
                success: false,
                message: 'Rating not found'
            });
        }
        
        if (existingRating.user_id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own ratings'
            });
        }
        
        const deletedRating = await Rating.deleteRating(id);
        const storeStats = await Rating.getAverageRating(existingRating.store_id);
        
        res.status(200).json({
            success: true,
            message: 'Rating deleted successfully',
            data: {
                deleted_rating: {
                    id: deletedRating.id,
                    rating: deletedRating.rating,
                    store_name: existingRating.store_name
                },
                updated_store_stats: storeStats
            }
        });
        
    } catch (error) {
        console.error('Error deleting rating:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error while deleting rating'
        });
    }
};

const getRatingById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const rating = await Rating.findRatingById(id);
        if (!rating) {
            return res.status(404).json({
                success: false,
                message: 'Rating not found'
            });
        }
        
        const formattedRating = {
            id: rating.id,
            rating: rating.rating,
            comment: rating.comment,
            user_name: rating.user_name,
            store_name: rating.store_name,
            created_at: rating.created_at,
            updated_at: rating.updated_at
        };
        
        res.status(200).json({
            success: true,
            message: 'Rating found successfully',
            data: {
                rating: formattedRating
            }
        });
        
    } catch (error) {
        console.error('Error fetching rating:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching rating'
        });
    }
};


module.exports = {
    submitRating,
    getStoreRatings,
    getMyRatings,
    updateMyRating,
    deleteMyRating,
    getRatingById
};
