const Store = require('../models/Store');
const Rating = require('../models/Rating');

const getMyStoreDashboard = async (req, res) => {
    try {
        const ownerId = req.user.id;
        const myStores = await Store.getStoresByOwner(ownerId);
        
        if (myStores.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No stores found. Contact admin to create a store for you.',
                data: {
                    stores: [],
                    total_stores: 0
                }
            });
        }
        
        const storesWithStats = await Promise.all(
            myStores.map(async (store) => {
                const ratingStats = await Rating.getAverageRating(store.id);
                const storeRatings = await Rating.getRatingsByStore(store.id);
                
                return {
                    id: store.id,
                    name: store.name,
                    email: store.email,
                    address: store.address,
                    created_at: store.created_at,
                    rating_stats: {
                        average_rating: ratingStats.average_rating,
                        total_ratings: ratingStats.total_ratings,
                        star_breakdown: ratingStats.star_breakdown
                    },
                    recent_ratings: storeRatings.slice(0, 5) 
                };
            })
        );

        const totalRatings = storesWithStats.reduce((sum, store) => sum + store.rating_stats.total_ratings, 0);
        const averageOfAverages = storesWithStats.length > 0 ? 
            (storesWithStats.reduce((sum, store) => sum + parseFloat(store.rating_stats.average_rating || 0), 0) / storesWithStats.length).toFixed(1) : 
            '0.0';

        res.status(200).json({
            success: true,
            message: 'Store owner dashboard data retrieved successfully',
            data: {
                overview: {
                    total_stores: myStores.length,
                    total_ratings_received: totalRatings,
                    overall_average_rating: averageOfAverages
                },
                stores: storesWithStats
            }
        });
        
    } catch (error) {
        console.error('Error fetching store owner dashboard:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching dashboard data'
        });
    }
};

const getUsersWhoRatedMyStores = async (req, res) => {
    try {
        const ownerId = req.user.id;
        const { storeId } = req.params; 

        const myStores = await Store.getStoresByOwner(ownerId);
        
        if (myStores.length === 0) {
            return res.status(200).json({
                success: true,
                message: 'No stores found',
                data: {
                    users: [],
                    total: 0
                }
            });
        }
        
        let targetStores = myStores;
        if (storeId) {
            const specificStore = myStores.find(store => store.id === storeId);
            if (!specificStore) {
                return res.status(403).json({
                    success: false,
                    message: 'You can only view ratings for your own stores'
                });
            }
            targetStores = [specificStore];
        }
        
        const allRatings = [];
        for (const store of targetStores) {
            const storeRatings = await Rating.getRatingsByStore(store.id);
            const ratingsWithStore = storeRatings.map(rating => ({
                ...rating,
                store_name: store.name,
                store_id: store.id
            }));
            allRatings.push(...ratingsWithStore);
        }

        const usersWhoRated = allRatings.map(rating => ({
            rating_id: rating.id,
            user_name: rating.user_name,
            rating: rating.rating,
            comment: rating.comment,
            store_name: rating.store_name,
            store_id: rating.store_id,
            created_at: rating.created_at
        }));
        
        usersWhoRated.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        
        res.status(200).json({
            success: true,
            message: `Found ${usersWhoRated.length} ratings for your stores`,
            data: {
                users: usersWhoRated,
                total: usersWhoRated.length,
                stores_included: targetStores.map(store => ({
                    id: store.id,
                    name: store.name
                }))
            }
        });
        
    } catch (error) {
        console.error('Error fetching users who rated stores:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching users who rated your stores'
        });
    }
};


const getMyStoreRatingStats = async (req, res) => {
    try {
        const ownerId = req.user.id;
        const { storeId } = req.params;
        
        const store = await Store.findStoreById(storeId);
        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'Store not found'
            });
        }
        
        if (store.owner_id !== ownerId) {
            return res.status(403).json({
                success: false,
                message: 'You can only view statistics for your own stores'
            });
        }
        
        const ratingStats = await Rating.getAverageRating(storeId);
        const allRatings = await Rating.getRatingsByStore(storeId);
        
        const detailedStats = {
            store_info: {
                id: store.id,
                name: store.name,
                address: store.address
            },
            rating_summary: {
                average_rating: ratingStats.average_rating,
                total_ratings: ratingStats.total_ratings,
                star_breakdown: ratingStats.star_breakdown
            },
            recent_ratings: allRatings.slice(0, 10).map(rating => ({
                user_name: rating.user_name,
                rating: rating.rating,
                comment: rating.comment,
                created_at: rating.created_at
            }))
        };

        res.status(200).json({
            success: true,
            message: 'Store rating statistics retrieved successfully',
            data: detailedStats
        });
        
    } catch (error) {
        console.error('Error fetching store rating stats:', error.message);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching store rating statistics'
        });
    }
};

module.exports = {
    getMyStoreDashboard,
    getUsersWhoRatedMyStores,
    getMyStoreRatingStats
};