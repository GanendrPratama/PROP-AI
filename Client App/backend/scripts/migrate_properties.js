const db = require('../database/pg.database');
const fs = require('fs');

async function migrateProperties() {
    console.log('Starting migration from properties to HousingAds...');

    try {
        // 1. Check if 'properties' table sends data
        const oldProps = await db.query('SELECT * FROM properties');
        console.log(`Found ${oldProps.rows.length} records in 'properties' table.`);

        if (oldProps.rows.length === 0) {
            console.log('No properties to migrate.');
            return;
        }

        // 2. Ensure we have a system user to own these ads
        // Check if user with ID 1 exists, if not create a dummy system user (optional but safer)
        let systemUserId = 1;

        // You might want to create a specific system user if user_id 1 is a real person.
        // For now we assume user_id 1 is safe or we use a hardcoded value.
        // Let's create a system user if it doesn't exist to be safe.
        const systemUserEmail = 'system@propai.com';
        const userCheck = await db.query('SELECT user_id FROM "Users" WHERE email = $1', [systemUserEmail]);

        if (userCheck.rows.length > 0) {
            systemUserId = userCheck.rows[0].user_id;
        } else {
            console.log('Creating system user for legacy properties...');
            const newUser = await db.query(`
                INSERT INTO "Users" (full_name, email, password_hash, phone_number)
                VALUES ('System Migration', $1, 'hash_placeholder', '000000000')
                RETURNING user_id
            `, [systemUserEmail]);
            systemUserId = newUser.rows[0].user_id;
        }

        console.log(`Using User ID ${systemUserId} for migrated ads.`);

        let successCount = 0;
        let errorCount = 0;

        // 3. Loop and Migration
        for (const prop of oldProps.rows) {
            try {
                // Check if this property location/price key already exists to avoid duplicates
                // (Simple check, might need robust logic if running multiple times)
                // We'll skip check for now and just insert.

                const {
                    id, location, price, lt, lb, bedrooms, toilet, garage, image_url
                } = prop;

                // Insert into HousingAds
                const insertAdQuery = `
                    INSERT INTO "HousingAds" 
                    (user_id, title, description, price, status, address, city, 
                     land_size_sqm, building_size_sqm, bedrooms, bathrooms, garage_capacity, 
                     contact_phone, facilities)
                    VALUES ($1, $2, $3, $4, 'active', $5, $5, $6, $7, $8, $9, $10, $11, $12)
                    RETURNING ad_id
                `;

                const title = `House in ${location}`;
                const description = 'Legacy property listing migrated from scraper.';

                const adRes = await db.query(insertAdQuery, [
                    systemUserId,
                    title,
                    description,
                    price,
                    location, // address
                    parseFloat(lt) || 0,
                    parseFloat(lb) || 0,
                    parseInt(bedrooms) || 0,
                    parseInt(toilet) || 0,
                    parseInt(garage) || 0,
                    '08000000000', // Default contact
                    'Legacy Listing'
                ]);

                const newAdId = adRes.rows[0].ad_id;

                // Insert Image
                if (image_url) {
                    await db.query(`
                        INSERT INTO "AdImages" (ad_id, cloudinary_url, is_primary)
                        VALUES ($1, $2, true)
                    `, [newAdId, image_url]);
                }

                successCount++;
            } catch (err) {
                console.error(`Failed to migrate property ID ${prop.id}:`, err.message);
                errorCount++;
            }
        }

        console.log(`Migration complete. Success: ${successCount}, Errors: ${errorCount}`);

    } catch (error) {
        console.error('Migration fatal error:', error);
    } finally {
        // We probably don't want to close the pool if this is run inside a larger app context,
        // but as a script we should.
        // db.end(); // If db export exposes end() or if running standalone.
        process.exit(0);
    }
}

migrateProperties();
