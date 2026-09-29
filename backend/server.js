import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config();

import app from './src/app.js';
import { testConnection } from './src/config/database.js';

const PORT = process.env.PORT || 5001;

async function start() {
    try {
        await testConnection();
    } catch (err) {
        console.warn('⚠️ Database connection notice:', err.message);
        console.warn('⚠️ Backend running in standalone fallback mode. Connect Supabase PostgreSQL to enable persistent cloud storage.');
    }

    app.listen(PORT, () => {
        console.log(`🚀 Life Harmony API running on http://localhost:${PORT}`);
        console.log(`🌱 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
}

start();