const baseResponse = require('../utils/baseResponse.util');
const predictRepository = require('../repositories/predict.repository');

/**
 * Transform frontend payload to ML API format
 */
const transformPayloadToAPI = (payload) => {
    return {
        location: payload.location || '',
        bedrooms: Number(payload.bedrooms) || 0,
        toilet: Number(payload.bathrooms) || 0,
        garage: Number(payload.garageCapacity) || 0,
        LT: Number(payload.landSize) || 0,
        LB: Number(payload.buildingArea) || 0,
    };
};

/**
 * Transform ML API response to frontend format
 */
const transformAPIResponse = (apiResponse) => {
    if (!apiResponse || typeof apiResponse.predicted_price_raw !== 'number') {
        throw new Error('Invalid API response: missing predicted_price_raw');
    }

    // Transform importances to object format
    const importances = {};
    apiResponse.feature_importance?.forEach(item => {
        importances[item.Feature] = item.Percentage / 100;
    });

    // Create breakdown with calculated values
    const breakdown = apiResponse.feature_importance?.map(item => ({
        label: item.Feature,
        value: (apiResponse.predicted_price_raw * item.Percentage) / 100,
        percentage: item.Percentage
    })) || [];

    return {
        model: 'random_forest',
        currency: 'IDR',
        estimatedPrice: Math.round(apiResponse.predicted_price_raw),
        priceFormatted: apiResponse.predicted_price_formatted,
        mostInfluentialFeature: apiResponse.most_influential_feature,
        importances,
        breakdown,
        raw: apiResponse
    };
};

/**
 * POST /api/predict - Get price prediction
 */
exports.predictPrice = async (req, res) => {
    try {
        console.log('[Predict Controller] Received prediction request:', req.body);

        // Transform payload to API format
        const apiPayload = transformPayloadToAPI(req.body);
        console.log('[Predict Controller] Transformed payload:', apiPayload);

        // Call ML prediction API
        const apiResponse = await predictRepository.callPredictionAPI(apiPayload);
        console.log('[Predict Controller] ML API response received');

        // Transform response to frontend format
        const result = transformAPIResponse(apiResponse);
        console.log('[Predict Controller] Prediction completed successfully');

        return baseResponse(res, true, 200, 'Prediction successful', result);
    } catch (error) {
        console.error('[Predict Controller] Error:', error.message);
        return baseResponse(res, false, 500, error.message, null);
    }
};
