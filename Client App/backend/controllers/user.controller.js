const baseResponse = require('../utils/baseResponse.util');
const userRepository = require('../repositories/user.repository');

/**
 * GET /api/users - Get all users
 */
exports.getAllUsers = async (req, res) => {
    try {
        const users = await userRepository.getAllUsers();
        return baseResponse(res, true, 200, 'Users retrieved successfully', users);
    } catch (error) {
        console.error('Get all users error:', error);
        return baseResponse(res, false, 500, 'Server error', null);
    }
};

/**
 * GET /api/users/:id - Get user by ID
 */
exports.getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await userRepository.getUserById(id);
        
        if (!user) {
            return baseResponse(res, false, 404, 'User not found', null);
        }
        
        return baseResponse(res, true, 200, 'User retrieved successfully', user);
    } catch (error) {
        console.error('Get user by ID error:', error);
        return baseResponse(res, false, 500, 'Server error', null);
    }
};

/**
 * POST /api/users/register - Register new user
 */
exports.registerUser = async (req, res) => {
    try {
        const { full_name, email, password, phone_number } = req.body;

        // Validation
        if (!full_name || !email || !password || !phone_number) {
            return baseResponse(res, false, 400, 'All fields are required', null);
        }

        // Check if email already exists
        const existingUser = await userRepository.getUserByEmail(email);
        if (existingUser) {
            return baseResponse(res, false, 400, 'Email already registered', null);
        }

        // Create user
        const newUser = await userRepository.createUser({
            full_name,
            email,
            password,
            phone_number
        });

        return baseResponse(res, true, 201, 'User registered successfully', newUser);
    } catch (error) {
        console.error('Register user error:', error);
        return baseResponse(res, false, 500, 'Server error', null);
    }
};

/**
 * POST /api/users/login - Login user
 */
exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return baseResponse(res, false, 400, 'Email and password are required', null);
        }

        // Verify credentials
        const user = await userRepository.verifyPassword(email, password);
        if (!user) {
            return baseResponse(res, false, 401, 'Invalid email or password', null);
        }

        return baseResponse(res, true, 200, 'Login successful', user);
    } catch (error) {
        console.error('Login user error:', error);
        return baseResponse(res, false, 500, 'Server error', null);
    }
};

/**
 * PUT /api/users/:id - Update user
 */
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { full_name, phone_number } = req.body;

        // Validation
        if (!full_name || !phone_number) {
            return baseResponse(res, false, 400, 'Full name and phone number are required', null);
        }

        const updatedUser = await userRepository.updateUser(id, {
            full_name,
            phone_number
        });

        if (!updatedUser) {
            return baseResponse(res, false, 404, 'User not found', null);
        }

        return baseResponse(res, true, 200, 'User updated successfully', updatedUser);
    } catch (error) {
        console.error('Update user error:', error);
        return baseResponse(res, false, 500, 'Server error', null);
    }
};

/**
 * DELETE /api/users/:id - Delete user
 */
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedUser = await userRepository.deleteUser(id);

        if (!deletedUser) {
            return baseResponse(res, false, 404, 'User not found', null);
        }

        return baseResponse(res, true, 200, 'User deleted successfully', deletedUser);
    } catch (error) {
        console.error('Delete user error:', error);
        return baseResponse(res, false, 500, 'Server error', null);
    }
};
