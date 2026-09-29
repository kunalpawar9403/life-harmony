import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../../backend/.env') });
dotenv.config();

const connectionString =
    process.env.SUPABASE_DB_URL ||
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    'postgresql://postgres:940016Ku%40%23Vi@db.vvcpapgdbbsdeipiklbl.supabase.co:5432/postgres';

const poolConfig = connectionString
    ? {
        connectionString,
        ssl: { rejectUnauthorized: false },
        max: 10,
        connectionTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
    }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT) || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'postgres',
        ssl: process.env.DB_SSL === 'false' ? false : { rejectUnauthorized: false },
        max: 10,
        connectionTimeoutMillis: 5000,
        idleTimeoutMillis: 30000,
    };

export const pool = new Pool(poolConfig);

/**
 * Transforms MySQL style queries to PostgreSQL format:
 * - Replaces ? parameter placeholders with $1, $2, etc. (skipping string literals)
 * - Converts MySQL DATE_SUB(CURDATE(), INTERVAL X DAY) to (CURRENT_DATE - INTERVAL 'X days')
 * - Converts INSERT IGNORE INTO to INSERT INTO ... ON CONFLICT DO NOTHING
 * - Appends RETURNING id to INSERT queries when needed so insertId is available
 */
export function transformQuery(sql) {
    if (!sql || typeof sql !== 'string') return sql;
    let transformed = sql;

    // Convert DATE_SUB
    transformed = transformed.replace(
        /DATE_SUB\s*\(\s*(?:CURDATE\(\)|CURRENT_DATE|NOW\(\))\s*,\s*INTERVAL\s+(\d+)\s+DAY\s*\)/gi,
        "CURRENT_DATE - INTERVAL '$1 days'"
    );

    // Convert INSERT IGNORE
    if (/INSERT\s+IGNORE\s+INTO/i.test(transformed)) {
        transformed = transformed.replace(/INSERT\s+IGNORE\s+INTO/i, 'INSERT INTO');
        if (!/ON\s+CONFLICT/i.test(transformed)) {
            transformed += ' ON CONFLICT DO NOTHING';
        }
    }

    // Auto-append RETURNING id for INSERT queries if not already present
    const isInsert = /^\s*INSERT\s+INTO\s+/i.test(transformed);
    if (isInsert && !/RETURNING/i.test(transformed) && !/ON\s+CONFLICT\s+DO\s+NOTHING/i.test(transformed)) {
        transformed += ' RETURNING id';
    }

    // Convert ? to $1, $2, ... safely avoiding quotes
    let paramIndex = 1;
    let inSingleQuote = false;
    let inDoubleQuote = false;
    let result = '';

    for (let i = 0; i < transformed.length; i++) {
        const char = transformed[i];
        if (char === "'" && !inDoubleQuote) {
            inSingleQuote = !inSingleQuote;
            result += char;
        } else if (char === '"' && !inSingleQuote) {
            inDoubleQuote = !inDoubleQuote;
            result += char;
        } else if (char === '?' && !inSingleQuote && !inDoubleQuote) {
            result += `$${paramIndex++}`;
        } else {
            result += char;
        }
    }

    return result;
}

function normalizeResult(res) {
    const rows = res.rows || [];
    if (rows.length > 0 && rows[0].id !== undefined) {
        rows.insertId = rows[0].id;
    }
    rows.rowCount = res.rowCount;
    return rows;
}

/**
 * Execute a query with parameter substitution and result normalization
 */
export async function query(sql, params = []) {
    const transformed = transformQuery(sql);
    const res = await pool.query(transformed, params);
    return normalizeResult(res);
}

/**
 * Wraps a pg client connection to support mysql2 compatible transaction API
 */
export async function getConnection() {
    const client = await pool.connect();
    return {
        async execute(sql, params = []) {
            const transformed = transformQuery(sql);
            const res = await client.query(transformed, params);
            const rows = normalizeResult(res);
            return [rows, res.fields];
        },
        async query(sql, params = []) {
            const transformed = transformQuery(sql);
            const res = await client.query(transformed, params);
            const rows = normalizeResult(res);
            return [rows, res.fields];
        },
        async beginTransaction() {
            return client.query('BEGIN');
        },
        async commit() {
            return client.query('COMMIT');
        },
        async rollback() {
            return client.query('ROLLBACK');
        },
        release() {
            client.release();
        }
    };
}

pool.getConnection = getConnection;

export async function testConnection() {
    const client = await pool.connect();
    const res = await client.query('SELECT NOW() as now');
    client.release();
    console.log('✅ Supabase PostgreSQL connected. Server time:', res.rows[0]?.now);
}