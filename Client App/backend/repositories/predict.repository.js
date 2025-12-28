const axios = require('axios');

const PREDICTION_API_URL = 'https://prop-ai-model-production.up.railway.app/prediction';
const DEFAULT_TIMEOUT = 30000; // 30 seconds

/**
 * Repository for handling ML prediction API calls
 */
class PredictRepository {
    /**
     * Call the ML prediction API
     * @param {Object} payload - Prediction payload with location, LT, LB, bedrooms, toilet, garage
     * @returns {Promise<Object>} Prediction result from ML API
     */
    async predictPrice(payload) {
        try {
            // Use environment variable or fallback to the production ML service
            const apiUrl = process.env.ML_API_URL || 'https://prop-ai-model-production.up.railway.app/prediction';

            console.log(`[PredictRepo] Sending request to: ${apiUrl}`);

            const response = await axios.post(apiUrl, payload, {
                headers: {
                    'Content-Type': 'application/json'
                },
                timeout: 30000 // 30 second timeout
            });

            return response.data;
        } catch (error) {
            if (error.code === 'ECONNABORTED') {
                throw new Error('Prediction request timeout. The ML server is taking too long to respond.');
            } else if (error.response) {
                throw new Error(`ML API error: ${error.response.status} - ${error.response.data}`);
            } else if (error.request) {
                throw new Error('Cannot connect to ML prediction server. Please ensure it is running.');
            } else {
                throw new Error(`Prediction error: ${error.message}`);
            }
        }
    }
}

module.exports = new PredictRepository();
