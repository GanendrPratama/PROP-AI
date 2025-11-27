const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const API_URL = `${API_BASE_URL}/api/housing-ads`

/**
 * Get all housing ads with optional filters
 * @param {Object} filters - { status, city, min_price, max_price }
 * @returns {Promise<Object>} - { success, statusCode, message, data: ads[] }
 */
export const getAllHousingAds = async (filters = {}) => {
  try {
    const params = new URLSearchParams()
    if (filters.status) params.append('status', filters.status)
    if (filters.city) params.append('city', filters.city)
    if (filters.min_price) params.append('min_price', filters.min_price)
    if (filters.max_price) params.append('max_price', filters.max_price)

    const url = params.toString() ? `${API_URL}?${params.toString()}` : API_URL
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch housing ads')
    }

    // Return with consistent structure, map 'payload' to 'data'
    return {
      success: result.success,
      data: result.payload,
      message: result.message
    }
  } catch (error) {
    console.error('[Housing Ad Service] Get all ads error:', error)
    throw error
  }
}

/**
 * Get housing ad by ID
 * @param {string} adId - Ad ID
 * @returns {Promise<Object>} - { success, statusCode, message, data: ad }
 */
export const getHousingAdById = async (adId) => {
  try {
    const response = await fetch(`${API_URL}/${adId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch housing ad')
    }

    return {
      success: result.success,
      data: result.payload,
      message: result.message
    }
  } catch (error) {
    console.error('[Housing Ad Service] Get ad by ID error:', error)
    throw error
  }
}

/**
 * Get housing ads by user ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - { success, statusCode, message, data: ads[] }
 */
export const getHousingAdsByUserId = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/user/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch user housing ads')
    }

    return {
      success: result.success,
      data: result.payload,
      message: result.message
    }
  } catch (error) {
    console.error('[Housing Ad Service] Get ads by user ID error:', error)
    throw error
  }
}

/**
 * Create new housing ad
 * @param {Object} adData - Housing ad data
 * @returns {Promise<Object>} - { success, statusCode, message, data: ad }
 */
export const createHousingAd = async (adData) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adData),
    })

    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to create housing ad')
    }

    return {
      success: result.success,
      data: result.payload,
      message: result.message
    }
  } catch (error) {
    console.error('[Housing Ad Service] Create ad error:', error)
    throw error
  }
}

/**
 * Update housing ad
 * @param {string} adId - Ad ID
 * @param {Object} adData - Updated housing ad data
 * @returns {Promise<Object>} - { success, statusCode, message, data: ad }
 */
export const updateHousingAd = async (adId, adData) => {
  try {
    const response = await fetch(`${API_URL}/${adId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(adData),
    })

    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to update housing ad')
    }

    return {
      success: result.success,
      data: result.payload,
      message: result.message
    }
  } catch (error) {
    console.error('[Housing Ad Service] Update ad error:', error)
    throw error
  }
}

/**
 * Delete housing ad
 * @param {string} adId - Ad ID
 * @returns {Promise<Object>} - { success, statusCode, message, data }
 */
export const deleteHousingAd = async (adId) => {
  try {
    const response = await fetch(`${API_URL}/${adId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to delete housing ad')
    }

    return {
      success: result.success,
      data: result.payload,
      message: result.message
    }
  } catch (error) {
    console.error('[Housing Ad Service] Delete ad error:', error)
    throw error
  }
}

/**
 * Add image to housing ad
 * @param {string} adId - Ad ID
 * @param {Object} imageData - { image_url, caption }
 * @returns {Promise<Object>} - { success, statusCode, message, data: image }
 */
export const addImageToAd = async (adId, imageData) => {
  try {
    const response = await fetch(`${API_URL}/${adId}/images`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(imageData),
    })

    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to add image')
    }

    return {
      success: result.success,
      data: result.payload,
      message: result.message
    }
  } catch (error) {
    console.error('[Housing Ad Service] Add image error:', error)
    throw error
  }
}

/**
 * Upload image to Cloudinary
 * @param {File} file - Image file
 * @returns {Promise<Object>} - { success, statusCode, message, data: { url, public_id } }
 */
export const uploadImage = async (file) => {
  try {
    const formData = new FormData()
    formData.append('image', file)

    const response = await fetch(`${API_URL}/upload-image`, {
      method: 'POST',
      body: formData,
    })

    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to upload image')
    }

    return {
      success: result.success,
      payload: result.payload,
      message: result.message
    }
  } catch (error) {
    console.error('[Housing Ad Service] Upload image error:', error)
    throw error
  }
}

/**
 * Delete image
 * @param {string} imageId - Image ID
 * @returns {Promise<Object>} - { success, statusCode, message, data }
 */
export const deleteImage = async (imageId) => {
  try {
    const response = await fetch(`${API_URL}/images/${imageId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to delete image')
    }

    return {
      success: result.success,
      data: result.payload,
      message: result.message
    }
  } catch (error) {
    console.error('[Housing Ad Service] Delete image error:', error)
    throw error
  }
}
