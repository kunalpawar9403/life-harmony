export function notFound(_req, res) {
    res.status(404).json({ message: 'Route not found' });
}

export function errorHandler(err, _req, res, _next) {
    console.error('💥 Error:', err.message || err);

    if (err.code === 'ECONNREFUSED' || err.message?.includes('ECONNREFUSED')) {
        return res.status(503).json({
            message: 'Database service is temporarily unavailable. If running on Vercel or cloud host, ensure your remote MySQL database credentials (DB_HOST, DB_USER, DB_PASSWORD, DB_NAME) are configured in environment variables.',
            code: 'DB_UNAVAILABLE'
        });
    }

    const status = err.status || 500;
    res.status(status).json({
        message: err.message || 'Internal server error',
    });
}