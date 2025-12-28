const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
const API_URL = `${API_BASE_URL}/api/users`

/**
 * Register a new user
 * @param {Object} userData - { full_name, email, password, phone_number }
 * @returns {Promise<Object>} - { success, statusCode, message, data }
 */
export const registerUser = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.message || 'Registration failed')
    }

    return result
  } catch (error) {
    console.error('[User Service] Register error:', error)
    throw error
  }
}

/**
 * Login user
 * @param {Object} credentials - { email, password }
 * @returns {Promise<Object>} - { success, statusCode, message, data: user }
 */
export const loginUser = async (credentials) => {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    })

    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.message || 'Login failed')
    }

    return result
  } catch (error) {
    console.error('[User Service] Login error:', error)
    throw error
  }
}

/**
 * Get all users
 * @returns {Promise<Object>} - { success, statusCode, message, data: users[] }
 */
export const getAllUsers = async () => {
  try {
    const response = await fetch(API_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch users')
    }

    return result
  } catch (error) {
    console.error('[User Service] Get all users error:', error)
    throw error
  }
}

/**
 * Get user by ID
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - { success, statusCode, message, data: user }
 */
export const getUserById = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to fetch user')
    }

    return result
  } catch (error) {
    console.error('[User Service] Get user by ID error:', error)
    throw error
  }
}

/**
 * Update user
 * @param {string} userId - User ID
 * @param {Object} userData - { full_name, phone_number }
 * @returns {Promise<Object>} - { success, statusCode, message, data: user }
 */
export const updateUser = async (userId, userData) => {
  try {
    const response = await fetch(`${API_URL}/${userId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })

    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to update user')
    }

    return result
  } catch (error) {
    console.error('[User Service] Update user error:', error)
    throw error
  }
}

/**
 * Delete user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} - { success, statusCode, message, data }
 */
export const deleteUser = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/${userId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    const result = await response.json()
    
    if (!response.ok) {
      throw new Error(result.message || 'Failed to delete user')
    }

    return result
  } catch (error) {
    console.error('[User Service] Delete user error:', error)
    throw error
  }
}
