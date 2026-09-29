import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';

export async function requireAuth(req, res, next) {
    try {
        const header = req.headers.authorization || '';
        const token = header.startsWith('Bearer ') ? header.slice(7) : null;
        if (!token) return res.status(401).json({ message: 'Authentication required' });

        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const rows = await query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [payload.sub]);
        if (!rows.length) return res.status(401).json({ message: 'User not found' });

        req.user = rows[0];
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
}

export async function requireAdmin(req, res, next) {
    try {
        const header = req.headers.authorization || '';
        const token = header.startsWith('Bearer ') ? header.slice(7) : null;
        if (!token) return res.status(401).json({ message: 'Authentication required' });

        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const rows = await query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [payload.sub]);
        if (!rows.length) return res.status(401).json({ message: 'User not found' });

        if (rows[0].role !== 'admin') {
            return res.status(403).json({ message: 'Access denied: Admin privileges required.' });
        }

        req.user = rows[0];
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
}

export function optionalAuth(req, _res, next) {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (token) {
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET);
            req.userId = payload.sub;
        } catch { /* ignore */ }
    }
    next();
}