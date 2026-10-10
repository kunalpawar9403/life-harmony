import jwt from 'jsonwebtoken';

export function signToken(userId, role = 'customer', extra = {}) {
    return jwt.sign(
        {
            sub: String(userId),
            role: role || 'customer',
            email: extra?.email,
            name: extra?.name,
        },
        process.env.JWT_SECRET || 'life_harmony_secret_fallback',
        {
            expiresIn: process.env.JWT_EXPIRES_IN || '7d',
        }
    );
}