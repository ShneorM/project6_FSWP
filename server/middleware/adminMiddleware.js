/**
 * Admin Authorization Middleware
 * Checks if the requesting user is an admin.
 * Expects the admin user ID to be sent in req.body.adminUserId or req.query.adminUserId.
 */
const pool = require('../config/db');

const adminMiddleware = async (req, res, next) => {
    const adminUserId = req.body?.adminUserId || req.query?.adminUserId;

    if (!adminUserId) {
        return res.status(403).json({ error: 'Access denied: admin authentication required' });
    }

    try {
        const [rows] = await pool.query(
            'SELECT id, is_admin FROM users WHERE id = ? AND is_admin = TRUE',
            [adminUserId]
        );

        if (rows.length === 0) {
            return res.status(403).json({ error: 'Access denied: admin privileges required' });
        }

        req.adminUser = rows[0];
        next();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = adminMiddleware;
