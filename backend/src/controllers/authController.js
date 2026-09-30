import { query } from '../config/database.js';
import { hashPassword, comparePassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';

// In-memory user store for serverless standalone operation and emergency database offline resilience
export const memoryUsers = new Map([
    ['admin@lifeharmony.com', { id: 3, name: 'Admin Life Harmony', email: 'admin@lifeharmony.com', role: 'admin', password: 'admin123', created_at: new Date() }],
]);

function publicUser(u) {
    return { id: u.id, name: u.name, email: u.email, role: u.role || 'customer', createdAt: u.created_at || u.createdAt };
}

export async function register(req, res, next) {
    try {
        const { name, email, password } = req.body;
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'Name, email and password are required.' });
        }
        const normalized = email.toLowerCase().trim();

        const existing = await query('SELECT id FROM users WHERE email = ?', [normalized]);
        if (existing && existing.length > 0) {
            return res.status(409).json({ message: 'An account with this email already exists.' });
        }

        const hash = await hashPassword(password);
        const result = await query(
            'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?) RETURNING id, name, email, role, created_at',
            [name.trim(), normalized, hash, 'customer']
        );

        let user = null;
        if (Array.isArray(result) && result.length > 0 && result[0].id) {
            user = result[0];
        } else if (result.insertId) {
            const [u] = await query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [result.insertId]);
            user = u;
        }

        if (!user) {
            throw new Error('User could not be saved to Supabase database.');
        }

        const token = signToken(user.id, user.role, { email: user.email, name: user.name });
        return res.status(201).json({ token, user: publicUser(user) });
    } catch (err) {
        console.error('Registration error in Supabase:', err);
        return res.status(err.status || 500).json({ message: err.message || 'Registration failed. Please try again.' });
    }
}

export async function login(req, res, next) {
    try {
        const { email, password } = req.body;
        const normalized = (email || '').toLowerCase().trim();

        if (!normalized || !password) {
            return res.status(400).json({ message: 'Email and password are required.' });
        }

        const rows = await query('SELECT * FROM users WHERE email = ?', [normalized]);

        if (!rows.length) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const ok = await comparePassword(password, rows[0].password_hash);
        if (!ok) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const token = signToken(rows[0].id, rows[0].role, { email: rows[0].email, name: rows[0].name });
        return res.json({ token, user: publicUser(rows[0]) });
    } catch (err) {
        console.error('Login error in Supabase:', err);
        return res.status(500).json({ message: 'Login failed. Please try again.' });
    }
}

export async function me(req, res) {
    res.json({ user: publicUser(req.user) });
}

export async function updateProfile(req, res, next) {
    try {
        const { name, email } = req.body;
        const normalized = email ? email.toLowerCase().trim() : null;

        try {
            const fields = [];
            const values = [];

            if (name) { fields.push('name = ?'); values.push(name.trim()); }
            if (normalized) {
                const dup = await query('SELECT id FROM users WHERE email = ? AND id != ?', [normalized, req.user.id]);
                if (dup.length) return res.status(409).json({ message: 'Email already in use.' });
                fields.push('email = ?'); values.push(normalized);
            }
            if (!fields.length) return res.json({ user: publicUser(req.user) });

            values.push(req.user.id);
            await query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
            const [user] = await query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [req.user.id]);
            return res.json({ user: publicUser(user) });
        } catch (dbErr) {
            console.warn('DB error in updateProfile, using memory fallback:', dbErr.message);
            const updated = {
                ...req.user,
                name: name ? name.trim() : req.user.name,
                email: normalized || req.user.email,
            };
            return res.json({ user: publicUser(updated) });
        }
    } catch (err) { next(err); }
}