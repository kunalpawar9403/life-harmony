import { query } from '../config/database.js';

const memoryAddresses = new Map();

export async function listAddresses(req, res) {
    try {
        const rows = await query('SELECT * FROM addresses WHERE user_id = ? ORDER BY id DESC', [req.user.id]);
        res.json({
            addresses: rows.map(r => ({
                id: r.id, label: r.label, line1: r.line1, line2: r.line2,
                city: r.city, state: r.state, zip: r.zip, country: r.country,
            }))
        });
    } catch (err) {
        console.warn('DB error in listAddresses, using memory:', err.message);
        res.json({ addresses: memoryAddresses.get(req.user.id) || [] });
    }
}

export async function addAddress(req, res) {
    const { label = 'Home', line1, line2 = null, city, state = null, zip, country = 'India' } = req.body;
    try {
        const r = await query(
            'INSERT INTO addresses (user_id, label, line1, line2, city, state, zip, country) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [req.user.id, label, line1, line2, city, state, zip, country]
        );
        res.status(201).json({ address: { id: r.insertId, label, line1, line2, city, state, zip, country } });
    } catch (err) {
        console.warn('DB error in addAddress, using memory:', err.message);
        const addresses = memoryAddresses.get(req.user.id) || [];
        const newAddr = { id: Date.now(), label, line1, line2, city, state, zip, country };
        addresses.unshift(newAddr);
        memoryAddresses.set(req.user.id, addresses);
        res.status(201).json({ address: newAddr });
    }
}

export async function removeAddress(req, res) {
    try {
        await query('DELETE FROM addresses WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        res.json({ message: 'Deleted' });
    } catch (err) {
        console.warn('DB error in removeAddress, using memory:', err.message);
        let addresses = memoryAddresses.get(req.user.id) || [];
        addresses = addresses.filter(a => String(a.id) !== String(req.params.id));
        memoryAddresses.set(req.user.id, addresses);
        res.json({ message: 'Deleted' });
    }
}