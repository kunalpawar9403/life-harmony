import dotenv from 'dotenv';
dotenv.config();

import app from './src/app.js';
import { testConnection } from './src/config/database.js';

const PORT = process.env.PORT || 5001;

async function start() {
    try {
        await testConnection();
        app.listen(PORT, () => {
            console.log(`🚀 Life Harmony API running on http://localhost:${PORT}`);
            console.log(`🌱 Environment: ${process.env.NODE_ENV || 'development'}`);
        });
    } catch (err) {
        console.error('❌ Failed to start server:', err.message);
        process.exit(1);
    }
}

start();