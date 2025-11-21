const baseResponse = require('../utils/baseResponse.util');
const housingAdRepository = require('../repositories/housingAd.repository');
const cloudinary = require('../config/cloudinary.config');


/**
 * GET /api/housing-ads - Get all housing ads
 */
exports.getAllAds = async (req, res) => {
    try {
        const { status, city, min_price, max_price } = req.query;
        
        const filters = {};
        if (status) filters.status = status;
        if (city) filters.city = city;
        if (min_price) filters.min_price = parseFloat(min_price);
        if (max_price) filters.max_price = parseFloat(max_price);

        const ads = await housingAdRepository.getAllAds(filters);
        return baseResponse(res, true, 200, 'Housing ads retrieved successfully', ads);
    } catch (error) {
        console.error('Get all housing ads error:', error);
        return baseResponse(res, false, 500, 'Server error', null);
    }
};

/**
 * GET /api/housing-ads/:id - Get housing ad by ID
 */
exports.getAdById = async (req, res) => {
    try {
        const { id } = req.params;
        const ad = await housingAdRepository.getAdById(id);
        
        if (!ad) {
            return baseResponse(res, false, 404, 'Housing ad not found', null);
        }
        
        return baseResponse(res, true, 200, 'Housing ad retrieved successfully', ad);
    } catch (error) {
        console.error('Get housing ad by ID error:', error);
        return baseResponse(res, false, 500, 'Server error', null);
    }
};

/**
 * GET /api/housing-ads/user/:userId - Get ads by user ID
 */
exports.getAdsByUserId = async (req, res) => {
    try {
        const { userId } = req.params;
        const ads = await housingAdRepository.getAdsByUserId(userId);
        return baseResponse(res, true, 200, 'User housing ads retrieved successfully', ads);
    } catch (error) {
        console.error('Get ads by user ID error:', error);
        return baseResponse(res, false, 500, 'Server error', null);
    }
};

/**
 * POST /api/housing-ads - Create new housing ad
 */
exports.createAd = async (req, res) => {
    try {
        console.log('Received create ad request:', req.body);
        const {
            user_id, title, description, price, status,
            address, city, province, postal_code,
            latitude, longitude, land_size_sqm, building_size_sqm,
            bedrooms, bathrooms, garage_capacity, facilities,
            contact_phone
        } = req.body;

        // Validation
        if (!user_id || !title || !price || !address || !bedrooms || !bathrooms || !contact_phone) {
            console.log('Validation failed - missing required fields');
            return baseResponse(res, false, 400, 'Required fields are missing', null);
        }

        const newAd = await housingAdRepository.createAd({
            user_id, title, description, price, status,
            address, city, province, postal_code,
            latitude, longitude, land_size_sqm, building_size_sqm,
            bedrooms, bathrooms, garage_capacity, facilities,
            contact_phone
        });

        console.log('Housing ad created successfully:', newAd);
        return baseResponse(res, true, 201, 'Housing ad created successfully', newAd);
    } catch (error) {
        console.error('Create housing ad error:', error);
        return baseResponse(res, false, 500, 'Server error', null);
    }
};

/**
 * PUT /api/housing-ads/:id - Update housing ad
 */
exports.updateAd = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            title, description, price, status,
            address, city, province, postal_code,
            latitude, longitude, land_size_sqm, building_size_sqm,
            bedrooms, bathrooms, garage_capacity, facilities,
            contact_phone
        } = req.body;

        // Validation
        if (!title || !price || !address || !bedrooms || !bathrooms || !contact_phone) {
            return baseResponse(res, false, 400, 'Required fields are missing', null);
        }

        const updatedAd = await housingAdRepository.updateAd(id, {
            title, description, price, status,
            address, city, province, postal_code,
            latitude, longitude, land_size_sqm, building_size_sqm,
            bedrooms, bathrooms, garage_capacity, facilities,
            contact_phone
        });

        if (!updatedAd) {
            return baseResponse(res, false, 404, 'Housing ad not found', null);
        }

        return baseResponse(res, true, 200, 'Housing ad updated successfully', updatedAd);
    } catch (error) {
        console.error('Update housing ad error:', error);
        return baseResponse(res, false, 500, 'Server error', null);
    }
};

/**
 * DELETE /api/housing-ads/:id - Delete housing ad
 */
exports.deleteAd = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedAd = await housingAdRepository.deleteAd(id);

        if (!deletedAd) {
            return baseResponse(res, false, 404, 'Housing ad not found', null);
        }

        return baseResponse(res, true, 200, 'Housing ad deleted successfully', deletedAd);
    } catch (error) {
        console.error('Delete housing ad error:', error);
        return baseResponse(res, false, 500, 'Server error', null);
    }
};

/**
 * POST /api/housing-ads/upload-image - Upload image to Cloudinary
 */
exports.uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return baseResponse(res, false, 400, 'Image file is required', null);
        }

        // Upload to Cloudinary using buffer
        const result = await cloudinary.uploader.upload_stream(
            { folder: 'propai/housing-ads', resource_type: 'image' },
            (error, result) => {
                if (error) {
                    return baseResponse(res, false, 500, 'Failed to upload image', null);
                }
                return baseResponse(res, true, 200, 'Image uploaded successfully', {
                    url: result.secure_url,
                    public_id: result.public_id,
                    width: result.width,
                    height: result.height
                });
            }
        ).end(req.file.buffer);
    } catch (error) {
        console.error('Upload image error:', error);
        return baseResponse(res, false, 500, 'Failed to upload image', null);
    }
};

/**
 * POST /api/housing-ads/:id/images - Add image to housing ad
 */
exports.addImage = async (req, res) => {
    try {
        const { id } = req.params;
        const { cloudinary_url, cloudinary_public_id, is_primary } = req.body;

        if (!cloudinary_url) {
            return baseResponse(res, false, 400, 'Cloudinary URL is required', null);
        }

        const image = await housingAdRepository.addImage(id, {
            cloudinary_url,
            cloudinary_public_id,
            is_primary
        });

        return baseResponse(res, true, 201, 'Image added successfully', image);
    } catch (error) {
        console.error('Add image error:', error);
        return baseResponse(res, false, 500, 'Server error', null);
    }
};

/**
 * DELETE /api/housing-ads/images/:imageId - Delete image
 */
exports.deleteImage = async (req, res) => {
    try {
        const { imageId } = req.params;
        const deletedImage = await housingAdRepository.deleteImage(imageId);

        if (!deletedImage) {
            return baseResponse(res, false, 404, 'Image not found', null);
        }

        return baseResponse(res, true, 200, 'Image deleted successfully', deletedImage);
    } catch (error) {
        console.error('Delete image error:', error);
        return baseResponse(res, false, 500, 'Server error', null);
    }
};
