const express = require('express');
const router = express.Router();

const { authenticateToken } = require('../middleware/auth');
const { 
    validateStoreCreation, 
    validateStoreUpdate 
} = require('../middleware/validation');

const {
    createStore,
    getAllStores,
    getStoreById,
    getMyStores,
    updateStore,
    deleteStore
} = require('../controllers/storeController');

router.get('/all', getAllStores);

router.get('/my-stores', authenticateToken, getMyStores);

router.get('/:id', getStoreById);

router.post('/create', authenticateToken, validateStoreCreation, createStore);

router.put('/:id', authenticateToken, validateStoreUpdate, updateStore);

router.delete('/:id', authenticateToken, deleteStore);

module.exports = router;