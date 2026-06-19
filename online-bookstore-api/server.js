const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const logger = require('./middleware/logger');
const bookRoutes = require('./routes/books');

// Load environment variables
dotenv.config();

const app = express();

// Body Parser Middleware to parse JSON payloads
app.use(express.json());

// Request logger middleware
app.use(logger);

// Mount API Routes
app.use('/api/books', bookRoutes);

// Catch-all route middleware for invalid endpoints (404 Not Found)
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        error: `Endpoint not found: ${req.originalUrl}`
    });
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
    console.error('Global Error Triggered:', err.stack);
    res.status(500).json({
        success: false,
        error: err.message || 'Internal Server Error'
    });
});

// Connect to MongoDB Database
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bookstore';
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('Successfully connected to MongoDB database instance.');
        const PORT = process.env.PORT || 5000;
        app.listen(PORT, () => {
            console.log(`Server is running in operational status on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Database connection failed:', error.message);
        process.exit(1);
    });
