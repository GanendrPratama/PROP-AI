require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

// Import routes
const userRoutes = require('./routes/user.route');
const housingAdRoutes = require('./routes/housingAd.route');
const predictRoutes = require('./routes/predict.route');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({ origin: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/housing-ads', housingAdRoutes);
app.use('/api/predict', predictRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found',
        payload: null
    });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        payload: null
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});

module.exports = app;
