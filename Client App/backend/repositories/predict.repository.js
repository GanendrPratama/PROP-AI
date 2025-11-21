const axios = require('axios');

const PREDICTION_API_URL = 'http://localhost:8000/prediction';
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
    async callPredictionAPI(payload) {
        try {
            const response = await axios.post(PREDICTION_API_URL, payload, {
                timeout: DEFAULT_TIMEOUT,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
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
