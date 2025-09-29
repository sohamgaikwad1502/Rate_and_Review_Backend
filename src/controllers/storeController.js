const Store = require('../models/Store');
const Rating = require('../models/Rating');

const createStore = async (req, res) => {
    try {
        const { name, email, address } = req.body;
        const ownerId = req.user.id; 
        
        const existingStore = await Store.storeExistsByEmail(email);
        if (existingStore) {
            return res.status(409).json({
                success: false,
                message: 'A store with this email already exists'
            });
        }
     
        const storeData = {
            name,
            email,
            address,
            owner_id: ownerId
        };
        
        const newStore = await Store.createStore(storeData);
        

        res.status(201).json({
            success: true,
            message: 'Store created successfully',
            data: {
                store: {
                    id: newStore.id,
                    name: newStore.name,
                    email: newStore.email,
                    address: newStore.address,
                    created_at: newStore.created_at
                }
            }
        });
        
    } catch (error) {

        res.status(500).json({
            success: false,
            message: 'Server error while creating store'
        });
    }
};


const getAllStores = async (req, res) => {
    try {
        const { name, address, sortBy, sortOrder } = req.query;
        const userId = req.user ? req.user.id : null; 
        
        const filters = {};
        if (name) filters.name = name;
        if (address) filters.address = address;

        const sorting = {
            sortBy: sortBy || 'created_at',
            sortOrder: sortOrder || 'desc'
        };
        
        const stores = filters.name || filters.address ? 
            await Store.getAllStoresWithFilters(filters, sorting) : 
            await Store.getAllStores();
        
        const storesWithRatings = await Promise.all(
            stores.map(async (store) => {
                const ratingStats = await Rating.getAverageRating(store.id);
                
                let userRating = null;
                if (userId) {
                    userRating = await Rating.findExistingRating(userId, store.id);
                }
                
                return {
                    id: store.id,
                    name: store.name,
                    email: store.email,
                    address: store.address,
                    owner_name: store.owner_name,
                    created_at: store.created_at,
                    rating_info: {
                        average_rating: ratingStats.average_rating,
                        total_ratings: ratingStats.total_ratings
                    },
                    user_rating: userRating ? {
                        rating: userRating.rating,
                        comment: userRating.comment,
                        created_at: userRating.created_at
                    } : null
                };
            })
        );

        res.status(200).json({
            success: true,
            message: `Found ${stores.length} stores`,
            data: {
                stores: storesWithRatings,
                total: stores.length,
                filters_applied: filters,
                sorting: sorting
            }
        });
        
    } catch (error) {

        res.status(500).json({
            success: false,
            message: 'Server error while fetching stores'
        });
    }
};


const getStoreById = async (req, res) => {
    try {
        const { id } = req.params;

        const store = await Store.findStoreById(id);
        
        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'Store not found'
            });
        }
        
        const ratingStats = await Rating.getAverageRating(id);
        
        const formattedStore = {
            id: store.id,
            name: store.name,
            email: store.email,
            address: store.address,
            owner_name: store.owner_name,
            owner_email: store.owner_email,
            created_at: store.created_at,
            rating_info: {
                average_rating: ratingStats.average_rating,
                total_ratings: ratingStats.total_ratings,
                star_breakdown: ratingStats.star_breakdown
            }
        };

        res.status(200).json({
            success: true,
            message: 'Store found successfully',
            data: {
                store: formattedStore
            }
        });
        
    } catch (error) {

        res.status(500).json({
            success: false,
            message: 'Server error while fetching store'
        });
    }
};


const getMyStores = async (req, res) => {
    try {
        const ownerId = req.user.id; 
        
        const stores = await Store.getStoresByOwner(ownerId);
        
        const formattedStores = stores.map(store => ({
            id: store.id,
            name: store.name,
            email: store.email,
            address: store.address,
            created_at: store.created_at,
            updated_at: store.updated_at
        }));
        res.status(200).json({
            success: true,
            message: `Found ${stores.length} stores owned by you`,
            data: {
                stores: formattedStores,
                total: stores.length
            }
        });
        
    } catch (error) {

        res.status(500).json({
            success: false,
            message: 'Server error while fetching your stores'
        });
    }
};

const updateStore = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, address } = req.body;
        const userId = req.user.id;
        
        const store = await Store.findStoreById(id);
        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'Store not found'
            });
        }
        
        if (store.owner_id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'You can only update your own stores'
            });
        }
        
        if (email !== store.email) {
            const emailExists = await Store.storeExistsByEmail(email);
            if (emailExists) {
                return res.status(409).json({
                    success: false,
                    message: 'This email is already used by another store'
                });
            }
        }
        
        const updateData = { name, email, address };
        const updatedStore = await Store.updateStore(id, updateData);
        
        res.status(200).json({
            success: true,
            message: 'Store updated successfully',
            data: {
                store: {
                    id: updatedStore.id,
                    name: updatedStore.name,
                    email: updatedStore.email,
                    address: updatedStore.address,
                    updated_at: updatedStore.updated_at
                }
            }
        });
        
    } catch (error) {

        res.status(500).json({
            success: false,
            message: 'Server error while updating store'
        });
    }
};

const deleteStore = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        

        const store = await Store.findStoreById(id);
        if (!store) {
            return res.status(404).json({
                success: false,
                message: 'Store not found'
            });
        }

        if (store.owner_id !== userId) {
            return res.status(403).json({
                success: false,
                message: 'You can only delete your own stores'
            });
        }
        
        await Store.deleteStore(id);
        
        res.status(200).json({
            success: true,
            message: 'Store deleted successfully',
            data: {
                deleted_store: {
                    id: store.id,
                    name: store.name
                }
            }
        });
        
    } catch (error) {

        res.status(500).json({
            success: false,
            message: 'Server error while deleting store'
        });
    }
};

module.exports = {
    createStore,
    getAllStores,
    getStoreById,
    getMyStores,
    updateStore,
    deleteStore
};
