import { query } from '../config/database.js';

export async function listAddresses(req, res, next) {
    try {
        const rows = await query('SELECT * FROM addresses WHERE user_id = ? ORDER BY id DESC', [req.user.id]);
        res.json({
            addresses: rows.map(r => ({
                id: r.id, label: r.label, line1: r.line1, line2: r.line2,
                city: r.city, state: r.state, zip: r.zip, country: r.country,
            }))
        });
    } catch (err) { next(err); }
}

export async function addAddress(req, res, next) {
    try {
        const { label = 'Home', line1, line2 = null, city, state = null, zip, country = 'United States' } = req.body;
        const r = await query(
            'INSERT INTO addresses (user_id, label, line1, line2, city, state, zip, country) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [req.user.id, label, line1, line2, city, state, zip, country]
        );
        res.status(201).json({ address: { id: r.insertId, label, line1, line2, city, state, zip, country } });
    } catch (err) { next(err); }
}

export async function removeAddress(req, res, next) {
    try {
        await query('DELETE FROM addresses WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        res.json({ message: 'Deleted' });
    } catch (err) { next(err); }
}