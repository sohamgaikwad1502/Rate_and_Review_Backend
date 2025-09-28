const User = require('../models/User');
const Store = require('../models/Store');
const Rating = require('../models/Rating');

const getDashboardStats = async (req, res) => {
    try {
        const userStats = await User.getUserStats();
        
        const storeStats = await Store.getStoreStats();
        
        const ratingStats = await Rating.getRatingStats();
        
        const dashboardData = {
            total_users: parseInt(userStats.total_users),
            total_stores: parseInt(storeStats.total_stores),
            total_ratings: parseInt(ratingStats.total_ratings),
            recent_activity: {
                users_this_month: parseInt(userStats.users_this_month),
                stores_this_month: parseInt(storeStats.stores_this_month),
                ratings_this_month: parseInt(ratingStats.ratings_this_month)
            },
            average_platform_rating: parseFloat(ratingStats.overall_average || 0).toFixed(1)
        };
        
        res.status(200).json({
            success: true,
            message: 'Dashboard statistics retrieved successfully',
            data: {
                dashboard: dashboardData
            }
        });
        
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching dashboard statistics'
        });
    }
};

const createUser = async (req, res) => {
    try {
        const { name, email, password, address, role } = req.body;
        
        const existingUser = await User.userExistsByEmail(email);
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User with this email already exists'
            });
        }
       
        const userData = {
            name,
            email,
            password,
            address,
            role: role || 'user' 
        };
        
        const newUser = await User.createUser(userData);
        
        res.status(201).json({
            success: true,
            message: `${role || 'User'} created successfully`,
            data: {
                user: {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    address: newUser.address,
                    role: newUser.role,
                    created_at: newUser.created_at
                }
            }
        });
        
    } catch (error) {
        console.error('Admin create user error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating user'
        });
    }
};


const getAllUsers = async (req, res) => {
    try {
        const { name, email, address, role, sortBy, sortOrder } = req.query;
        
        const filters = {};
        if (name) filters.name = name;
        if (email) filters.email = email;
        if (address) filters.address = address;
        if (role) filters.role = role;
        
        const sorting = {
            sortBy: sortBy || 'created_at',
            sortOrder: sortOrder || 'desc'
        };
        
        const users = await User.getAllUsersWithFilters(filters, sorting);
        
        const formattedUsers = users.map(user => ({
            id: user.id,
            name: user.name,
            email: user.email,
            address: user.address,
            role: user.role,
            created_at: user.created_at,
            ...(user.role === 'store_owner' && user.average_rating && {
                average_rating: user.average_rating
            })
        }));
        
        res.status(200).json({
            success: true,
            message: `Found ${users.length} users`,
            data: {
                users: formattedUsers,
                total: users.length,
                filters_applied: filters,
                sorting: sorting
            }
        });
        
    } catch (error) {
        console.error('Admin get all users error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching users'
        });
    }
};

const getAllStoresAdmin = async (req, res) => {
    try {
        const { name, email, address, sortBy, sortOrder } = req.query;
        
        const filters = {};
        if (name) filters.name = name;
        if (email) filters.email = email;
        if (address) filters.address = address;
        
        const sorting = {
            sortBy: sortBy || 'created_at',
            sortOrder: sortOrder || 'desc'
        };
        
        const stores = await Store.getAllStoresWithFilters(filters, sorting);
        
        const storesWithRatings = await Promise.all(
            stores.map(async (store) => {
                const ratingStats = await Rating.getAverageRating(store.id);
                return {
                    id: store.id,
                    name: store.name,
                    email: store.email,
                    address: store.address,
                    owner_name: store.owner_name,
                    created_at: store.created_at,
                    rating: ratingStats.average_rating || '0.0',
                    total_ratings: ratingStats.total_ratings
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
        console.error('Admin get all stores error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching stores'
        });
    }
};

const getUserDetails = async (req, res) => {
    try {
        const { id } = req.params;
        
        const user = await User.findUserById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }
        
        const userDetails = {
            id: user.id,
            name: user.name,
            email: user.email,
            address: user.address,
            role: user.role,
            created_at: user.created_at
        };
        
        if (user.role === 'store_owner') {
            const userStores = await Store.getStoresByOwner(id);
            if (userStores.length > 0) {
                const storeRatings = await Promise.all(
                    userStores.map(async (store) => {
                        const rating = await Rating.getAverageRating(store.id);
                        return {
                            store_name: store.name,
                            average_rating: rating.average_rating,
                            total_ratings: rating.total_ratings
                        };
                    })
                );
                userDetails.stores = storeRatings;
            }
        }
        
        res.status(200).json({
            success: true,
            message: 'User details retrieved successfully',
            data: {
                user: userDetails
            }
        });
        
    } catch (error) {
        console.error('Admin get user details error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while fetching user details'
        });
    }
};

const createStore = async (req, res) => {
    try {
        const { name, email, address, owner_id } = req.body;
        
        const existingStore = await Store.storeExistsByEmail(email);
        if (existingStore) {
            return res.status(409).json({
                success: false,
                message: 'A store with this email already exists'
            });
        }
        
        const owner = await User.findUserById(owner_id);
        if (!owner) {
            return res.status(404).json({
                success: false,
                message: 'Store owner not found'
            });
        }
        
        if (owner.role !== 'store_owner') {
            return res.status(400).json({
                success: false,
                message: 'Selected user is not a store owner'
            });
        }
        
        const storeData = { name, email, address, owner_id };
        const newStore = await Store.createStore(storeData);
        
        res.status(201).json({
            success: true,
            message: 'Store created successfully by admin',
            data: {
                store: {
                    id: newStore.id,
                    name: newStore.name,
                    email: newStore.email,
                    address: newStore.address,
                    owner_name: owner.name,
                    created_at: newStore.created_at
                }
            }
        });
        
    } catch (error) {
        console.error('Admin create store error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error while creating store'
        });
    }
};


module.exports = {
    getDashboardStats,
    createUser,
    getAllUsers,
    getAllStoresAdmin,
    getUserDetails,
    createStore
};