const API_URL = 'http://localhost:8000/prediction'
const DEFAULT_TIMEOUT = 30000 // 30 seconds for ML prediction

/**
 * Creates an AbortController with timeout
 */
const createTimeoutController = (timeoutMs) => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => {
    console.error(`[Predict Service] Request timeout after ${timeoutMs}ms`)
    controller.abort()
  }, timeoutMs)
  
  return {
    controller,
    clearTimeout: () => clearTimeout(timeoutId)
  }
}

/**
 * Transform frontend payload to backend API format
 * Frontend format: { location, landSize, buildingArea, bedrooms, bathrooms, garageCapacity, ... }
 * Backend format: { location, LT, LB, bedrooms, toilet, garage }
 */
const transformPayloadToAPI = (payload) => {
  const apiPayload = {
    location: payload.location || '',
    bedrooms: Number(payload.bedrooms) || 0,
    toilet: Number(payload.bathrooms) || 0,
    garage: Number(payload.garageCapacity) || 0,
    LT: Number(payload.landSize) || 0,
    LB: Number(payload.buildingArea) || 0,
  }
  
  console.log('[Predict Service] Transformed payload:', apiPayload)
  return apiPayload
}

/**
 * Transform backend response to frontend format
 * Backend format: { predicted_price_raw, predicted_price_formatted, most_influential_feature, feature_importance }
 * Frontend format: { model, currency, estimatedPrice, priceFormatted, mostInfluentialFeature, importances, breakdown }
 */
const transformAPIResponse = (apiResponse) => {
  console.log('[Predict Service] Raw API response:', apiResponse)
  
  // Validate response
  if (!apiResponse || typeof apiResponse.predicted_price_raw !== 'number') {
    throw new Error('Invalid API response: missing predicted_price_raw')
  }
  
  // Calculate total percentage for validation
  const totalPercentage = apiResponse.feature_importance?.reduce(
    (sum, item) => sum + (item.Percentage || 0), 
    0
  ) || 0
  
  console.log('[Predict Service] Total feature importance:', totalPercentage.toFixed(2) + '%')
  
  // Transform importances to object format
  const importances = {}
  apiResponse.feature_importance?.forEach(item => {
    importances[item.Feature] = item.Percentage / 100 // Convert to decimal (0-1)
  })
  
  // Create breakdown with calculated values
  const breakdown = apiResponse.feature_importance?.map(item => ({
    label: item.Feature,
    value: (apiResponse.predicted_price_raw * item.Percentage) / 100,
    percentage: item.Percentage
  })) || []
  
  const result = {
    model: 'random_forest',
    currency: 'IDR',
    estimatedPrice: Math.round(apiResponse.predicted_price_raw),
    priceFormatted: apiResponse.predicted_price_formatted,
    mostInfluentialFeature: apiResponse.most_influential_feature,
    importances,
    breakdown,
    raw: apiResponse // Keep original for debugging
  }
  
  console.log('[Predict Service] Transformed result:', result)
  return result
}

/**
 * Main prediction function
 * Sends request to prediction API and waits for response
 */
export async function predictPrice(payload) {
  console.log('[Predict Service] Starting prediction request...')
  console.log('[Predict Service] Input payload:', payload)
  
  const { controller, clearTimeout } = createTimeoutController(DEFAULT_TIMEOUT)
  
  try {
    // Transform payload to API format
    const apiPayload = transformPayloadToAPI(payload)
    
    console.log('[Predict Service] Sending POST to', API_URL)
    console.log('[Predict Service] Request body:', JSON.stringify(apiPayload, null, 2))
    
    // Make request to prediction API
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(apiPayload),
      signal: controller.signal
    })
    
    clearTimeout()
    
    console.log('[Predict Service] Response status:', response.status, response.statusText)
    
    // Check response status
    if (!response.ok) {
      const errorText = await response.text()
      console.error('[Predict Service] API error response:', errorText)
      throw new Error(`API returned status ${response.status}: ${errorText}`)
    }
    
    // Parse JSON response
    const apiResponse = await response.json()
    console.log('[Predict Service] Successfully received response')
    
    // Transform and return result
    const result = transformAPIResponse(apiResponse)
    console.log('[Predict Service] Prediction completed successfully')
    
    return result
    
  } catch (error) {
    clearTimeout()
    
    // Log detailed error information
    if (error.name === 'AbortError') {
      console.error('[Predict Service] Request timeout - server took too long to respond')
      throw new Error('Request timeout. The prediction server is taking too long to respond. Please try again.')
    } else if (error.message.includes('fetch')) {
      console.error('[Predict Service] Network error - cannot connect to server')
      console.error('[Predict Service] Error details:', error)
      throw new Error('Cannot connect to prediction server. Please ensure the server is running at ' + API_URL)
    } else {
      console.error('[Predict Service] Prediction error:', error.message)
      console.error('[Predict Service] Error stack:', error.stack)
      throw error
    }
  }
}

export default predictPrice
