const db = require('./pg.database');
const fs = require('fs');
const path = require('path');

async function applySchema() {
    try {
        console.log('Applying properties schema...');
        const schemaPath = path.join(__dirname, 'schema_properties.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');

        await db.query(schema);
        console.log('Schema applied successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Failed to apply schema:', error);
        process.exit(1);
    }
}

applySchema();
