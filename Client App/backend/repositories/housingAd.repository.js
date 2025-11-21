const db = require('../database/pg.database');

class HousingAdRepository {
    /**
     * Get all housing ads
     */
    async getAllAds(filters = {}) {
        let query = `
            SELECT h.*, u.full_name, u.email, u.phone_number as user_phone,
                   (SELECT json_agg(json_build_object('image_id', image_id, 'cloudinary_url', cloudinary_url, 'is_primary', is_primary))
                    FROM "AdImages" WHERE ad_id = h.ad_id) as images
            FROM "HousingAds" h
            JOIN "Users" u ON h.user_id = u.user_id
            WHERE 1=1
        `;
        const params = [];
        let paramIndex = 1;

        // Apply filters
        if (filters.status) {
            query += ` AND h.status = $${paramIndex}`;
            params.push(filters.status);
            paramIndex++;
        }
        if (filters.city) {
            query += ` AND h.city ILIKE $${paramIndex}`;
            params.push(`%${filters.city}%`);
            paramIndex++;
        }
        if (filters.min_price) {
            query += ` AND h.price >= $${paramIndex}`;
            params.push(filters.min_price);
            paramIndex++;
        }
        if (filters.max_price) {
            query += ` AND h.price <= $${paramIndex}`;
            params.push(filters.max_price);
            paramIndex++;
        }

        query += ' ORDER BY h.created_at DESC';

        const result = await db.query(query, params);
        return result.rows;
    }

    /**
     * Get housing ad by ID
     */
    async getAdById(adId) {
        const result = await db.query(
            `SELECT h.*, u.full_name, u.email, u.phone_number as user_phone,
                    (SELECT json_agg(json_build_object('image_id', image_id, 'cloudinary_url', cloudinary_url, 'is_primary', is_primary))
                     FROM "AdImages" WHERE ad_id = h.ad_id) as images
             FROM "HousingAds" h
             JOIN "Users" u ON h.user_id = u.user_id
             WHERE h.ad_id = $1`,
            [adId]
        );
        return result.rows[0];
    }

    /**
     * Get housing ads by user ID
     */
    async getAdsByUserId(userId) {
        const result = await db.query(
            `SELECT h.*,
                    (SELECT json_agg(json_build_object('image_id', image_id, 'cloudinary_url', cloudinary_url, 'is_primary', is_primary))
                     FROM "AdImages" WHERE ad_id = h.ad_id) as images
             FROM "HousingAds" h
             WHERE h.user_id = $1
             ORDER BY h.created_at DESC`,
            [userId]
        );
        return result.rows;
    }

    /**
     * Create new housing ad
     */
    async createAd(adData) {
        const {
            user_id, title, description, price, status,
            address, city, province, postal_code,
            latitude, longitude, land_size_sqm, building_size_sqm,
            bedrooms, bathrooms, garage_capacity, facilities,
            contact_phone
        } = adData;

        const result = await db.query(
            `INSERT INTO "HousingAds" 
             (user_id, title, description, price, status, address, city, province, postal_code,
              latitude, longitude, land_size_sqm, building_size_sqm, bedrooms, bathrooms, 
              garage_capacity, facilities, contact_phone)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
             RETURNING *`,
            [user_id, title, description, price, status || 'active', address, city, province, postal_code,
             latitude, longitude, land_size_sqm, building_size_sqm, bedrooms, bathrooms,
             garage_capacity || 0, facilities, contact_phone]
        );
        return result.rows[0];
    }

    /**
     * Update housing ad
     */
    async updateAd(adId, adData) {
        const {
            title, description, price, status,
            address, city, province, postal_code,
            latitude, longitude, land_size_sqm, building_size_sqm,
            bedrooms, bathrooms, garage_capacity, facilities,
            contact_phone
        } = adData;

        const result = await db.query(
            `UPDATE "HousingAds" 
             SET title = $1, description = $2, price = $3, status = $4,
                 address = $5, city = $6, province = $7, postal_code = $8,
                 latitude = $9, longitude = $10, land_size_sqm = $11, building_size_sqm = $12,
                 bedrooms = $13, bathrooms = $14, garage_capacity = $15, facilities = $16,
                 contact_phone = $17
             WHERE ad_id = $18
             RETURNING *`,
            [title, description, price, status, address, city, province, postal_code,
             latitude, longitude, land_size_sqm, building_size_sqm, bedrooms, bathrooms,
             garage_capacity, facilities, contact_phone, adId]
        );
        return result.rows[0];
    }

    /**
     * Delete housing ad
     */
    async deleteAd(adId) {
        const result = await db.query(
            'DELETE FROM "HousingAds" WHERE ad_id = $1 RETURNING ad_id',
            [adId]
        );
        return result.rows[0];
    }

    /**
     * Add image to housing ad
     */
    async addImage(adId, imageData) {
        const { cloudinary_url, cloudinary_public_id, is_primary } = imageData;
        
        const result = await db.query(
            `INSERT INTO "AdImages" (ad_id, cloudinary_url, cloudinary_public_id, is_primary)
             VALUES ($1, $2, $3, $4)
             RETURNING *`,
            [adId, cloudinary_url, cloudinary_public_id, is_primary || false]
        );
        return result.rows[0];
    }

    /**
     * Delete image
     */
    async deleteImage(imageId) {
        const result = await db.query(
            'DELETE FROM "AdImages" WHERE image_id = $1 RETURNING *',
            [imageId]
        );
        return result.rows[0];
    }
}

module.exports = new HousingAdRepository();
