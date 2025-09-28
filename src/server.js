const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
require('dotenv').config();

const { testConnection } = require('./config/database');

const authRoutes = require('./routes/auth');
const storeRoutes = require('./routes/stores');
const ratingRoutes = require('./routes/ratings');
const adminRoutes = require('./routes/admin');
const storeOwnerRoutes = require('./routes/storeOwner');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));


app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

app.use('/auth', authRoutes);
app.use('/stores', storeRoutes);
app.use('/ratings', ratingRoutes);
app.use('/admin', adminRoutes);
app.use('/store-owner', storeOwnerRoutes);

app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        path: req.originalUrl
    });
});

app.use((error, req, res, next) => {
    console.error('Server error:', error);
    
    res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
});


const startServer = async () => {
    try {
        console.log('Connecting to database...');
        const dbConnected = await testConnection();
        
        if (!dbConnected) {
            console.error('Cannot start server: Database connection failed');
            process.exit(1);
        }
        
        app.listen(PORT, () => {
            console.log('Database connected successfully');
            console.log('Server started successfully!');
            console.log(`Server running on http://localhost:${PORT}`);
        });
        
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();