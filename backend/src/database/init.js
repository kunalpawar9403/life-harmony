import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function init() {
    const connectionString =
        process.env.SUPABASE_DB_URL ||
        process.env.DATABASE_URL ||
        process.env.POSTGRES_URL;

    const clientConfig = connectionString
        ? { connectionString, ssl: { rejectUnauthorized: false } }
        : {
            host: process.env.DB_HOST || 'localhost',
            port: Number(process.env.DB_PORT) || 5432,
            user: process.env.DB_USER || 'postgres',
            password: process.env.DB_PASSWORD || '',
            database: process.env.DB_NAME || 'postgres',
            ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
        };

    const client = new pg.Client(clientConfig);
    await client.connect();

    const schemaPath = path.join(__dirname, 'supabase_schema.sql');
    console.log(`📦 Applying Supabase schema from ${schemaPath}...`);
    const schema = await fs.readFile(schemaPath, 'utf8');

    await client.query(schema);
    console.log('✅ Supabase PostgreSQL schema applied successfully.');
    await client.end();
}

init().catch((err) => {
    console.error('❌ Supabase DB init failed:', err.message);
    process.exit(1);
});