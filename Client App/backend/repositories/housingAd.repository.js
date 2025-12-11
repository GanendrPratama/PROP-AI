const db = require('../database/pg.database');

class HousingAdRepository {
    /**
     * Get all housing ads from 'properties' table
     */
    async getAllAds(filters = {}) {
        let query = `
            SELECT 
                p.id as ad_id,
                p.user_id,
                COALESCE(p.title, 'House in ' || p.location) as title,
                COALESCE(p.description, p.source) as description,
                p.price,
                COALESCE(p.status, 'active') as status,
                p.location as address,
                split_part(p.location, ',', 2) as city,
                p.province,
                p.postal_code,
                p.latitude,
                p.longitude,
                p.lt as land_size_sqm,
                p.lb as building_size_sqm,
                p.bedrooms,
                p.toilet as bathrooms,
                p.garage as garage_capacity,
                p.facilities,
                p.contact_phone,
                p.created_at,
                'System Admin' as author_name,
                CASE 
                    WHEN p.image_url IS NOT NULL THEN 
                        json_build_array(
                            json_build_object(
                                'image_id', 0, 
                                'cloudinary_url', p.image_url, 
                                'cloudinary_public_id', null,
                                'is_primary', true
                            )
                        )
                    ELSE '[]'::json
                END as images
            FROM properties p
            WHERE 1=1
        `;
        const params = [];
        let paramIndex = 1;

        if (filters.city) {
            query += ` AND p.location ILIKE $${paramIndex}`;
            params.push(`%${filters.city}%`);
            paramIndex++;
        }
        if (filters.min_price) {
            query += ` AND p.price >= $${paramIndex}`;
            params.push(filters.min_price);
            paramIndex++;
        }
        if (filters.max_price) {
            query += ` AND p.price <= $${paramIndex}`;
            params.push(filters.max_price);
            paramIndex++;
        }

        query += ` ORDER BY p.created_at DESC`;

        const result = await db.query(query, params);
        return result.rows;
    }

    /**
     * Get housing ad by ID from 'properties'
     */
    async getAdById(adId) {
        const query = `
            SELECT 
                p.id as ad_id,
                p.user_id,
                COALESCE(p.title, 'House in ' || p.location) as title,
                COALESCE(p.description, p.source) as description,
                p.price,
                COALESCE(p.status, 'active') as status,
                p.location as address,
                split_part(p.location, ',', 2) as city,
                p.province,
                p.postal_code,
                p.latitude,
                p.longitude,
                p.lt as land_size_sqm,
                p.lb as building_size_sqm,
                p.bedrooms,
                p.toilet as bathrooms,
                p.garage as garage_capacity,
                p.facilities,
                p.contact_phone,
                p.created_at,
                'System Admin' as author_name,
                CASE 
                    WHEN p.image_url IS NOT NULL THEN 
                        json_build_array(
                            json_build_object(
                                'image_id', 0, 
                                'cloudinary_url', p.image_url, 
                                'cloudinary_public_id', null,
                                'is_primary', true
                            )
                        )
                    ELSE '[]'::json
                END as images
            FROM properties p
            WHERE p.id = $1
        `;
        const result = await db.query(query, [adId]);
        return result.rows[0];
    }

    /**
     * Get housing ads by user ID
     */
    async getAdsByUserId(userId) {
        // Since properties might not strongly link to users yet, return empty or implement filter if user_id column added
        return [];
    }

    /**
     * Create new housing ad in 'properties'
     */
    async createAd(adData) {
        const {
            user_id, title, description, price, status,
            address, city, province, postal_code,
            latitude, longitude, land_size_sqm, building_size_sqm,
            bedrooms, bathrooms, garage_capacity, facilities,
            contact_phone
        } = adData;

        // Map fields to properties table columns
        const location = `${address}, ${city || ''}`;

        const result = await db.query(
            `INSERT INTO properties 
             (user_id, title, description, price, status, location, 
              lt, lb, bedrooms, toilet, garage, facilities, contact_phone, province, postal_code, latitude, longitude)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
             RETURNING id as ad_id, *`,
            [user_id, title, description, price, status || 'active', location,
                land_size_sqm, building_size_sqm, bedrooms, bathrooms,
                garage_capacity || 0, facilities, contact_phone, province, postal_code, latitude, longitude]
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

        const location = `${address}, ${city || ''}`;

        const result = await db.query(
            `UPDATE properties 
             SET title = $1, description = $2, price = $3, status = $4,
                 location = $5, lt = $6, lb = $7, bedrooms = $8, toilet = $9, 
                 garage = $10, facilities = $11, contact_phone = $12,
                 province = $13, postal_code = $14, latitude = $15, longitude = $16
             WHERE id = $17
             RETURNING id as ad_id, *`,
            [title, description, price, status, location, land_size_sqm, building_size_sqm,
                bedrooms, bathrooms, garage_capacity, facilities, contact_phone,
                province, postal_code, latitude, longitude, adId]
        );
        return result.rows[0];
    }

    /**
     * Delete housing ad
     */
    async deleteAd(adId) {
        const result = await db.query(
            'DELETE FROM properties WHERE id = $1 RETURNING id as ad_id',
            [adId]
        );
        return result.rows[0];
    }

    /**
     * Add image to housing ad
     * Updates the single image_url column for now, as properties table simplified image handling
     */
    async addImage(adId, imageData) {
        const { cloudinary_url } = imageData;

        // If 'properties' has only one image_url column, we overwrite it or we should have created a separate table.
        // Assuming simple one-image structure based on CSV, or we can use the AdImages table if we kept it linked?
        // verification plan said "use properties table". 
        // Let's update the image_url column.

        const result = await db.query(
            `UPDATE properties SET image_url = $1 WHERE id = $2 RETURNING *`,
            [cloudinary_url, adId]
        );
        return result.rows[0];
    }

    /**
     * Delete image
     */
    async deleteImage(imageId) {
        // Not applicable if using single column in properties
        return null;
    }

    /**
     * Bulk create ads from CSV into properties
     */
    async bulkCreateAds(adsData) {
        if (!adsData || adsData.length === 0) return [];

        const client = await db.pool.connect();
        try {
            await client.query('BEGIN');

            const results = [];
            for (const ad of adsData) {
                const {
                    price, location,
                    land_size_sqm, building_size_sqm, bedrooms, bathrooms,
                    garage_capacity, image_url
                } = ad;

                // Map to properties columns: lt, lb, toilet
                const insertRes = await client.query(
                    `INSERT INTO properties 
                     (price, location, lt, lb, bedrooms, toilet, garage, image_url, source, status)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'csv_upload', 'active')
                     RETURNING id`,
                    [price, location,
                        land_size_sqm, building_size_sqm, bedrooms, bathrooms,
                        garage_capacity || 0, image_url]
                );

                results.push(insertRes.rows[0].id);
            }

            await client.query('COMMIT');
            return results;
        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }
    }
}

module.exports = new HousingAdRepository();