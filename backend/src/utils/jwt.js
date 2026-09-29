import jwt from 'jsonwebtoken';

export function signToken(userId, role = 'customer') {
    return jwt.sign({ sub: userId, role }, process.env.JWT_SECRET || 'life_harmony_secret_fallback', {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
}