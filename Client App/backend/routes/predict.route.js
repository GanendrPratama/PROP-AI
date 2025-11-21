const express = require('express');
const router = express.Router();
const predictController = require('../controllers/predict.controller');

// POST /api/predict - Get price prediction for property
router.post('/', predictController.predictPrice);

module.exports = router;
