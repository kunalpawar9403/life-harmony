import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function init() {
    const conn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 3306,
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        multipleStatements: true,
    });

    const schema = await fs.readFile(path.join(__dirname, 'schema.sql'), 'utf8');
    console.log('📦 Applying schema...');
    await conn.query(schema);
    console.log('✅ Schema applied successfully.');
    await conn.end();
}

init().catch((err) => {
    console.error('❌ DB init failed:', err.message);
    process.exit(1);
});