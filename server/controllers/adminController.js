const pool = require('../config/db');

/**
 * Admin Controller
 * All methods are protected by adminMiddleware at the route level.
 */

// GET /api/admin/users - Fetch all users with stats (post count, todo count)
exports.getAllUsersWithStats = async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT 
                u.id,
                u.name,
                u.username,
                u.is_admin,
                u.is_blocked,
                COUNT(DISTINCT CASE WHEN t.is_deleted = FALSE THEN t.id END) AS todo_count,
                COUNT(DISTINCT CASE WHEN p.is_deleted = FALSE THEN p.id END) AS post_count
            FROM users u
            LEFT JOIN todos t ON t.user_id = u.id
            LEFT JOIN posts p ON p.user_id = u.id
            GROUP BY u.id, u.name, u.username, u.is_admin, u.is_blocked
            ORDER BY u.id ASC
        `);

        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// PUT /api/admin/users/:id/toggle-block - Toggle is_blocked status
exports.toggleBlockUser = async (req, res) => {
    const { id } = req.params;

    try {
        // Don't allow blocking yourself (admin)
        const adminUserId = req.body.adminUserId || req.query.adminUserId;
        if (String(id) === String(adminUserId)) {
            return res.status(400).json({ error: 'Cannot block your own admin account' });
        }

        // Toggle the is_blocked field
        const [result] = await pool.query(
            'UPDATE users SET is_blocked = NOT is_blocked WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Fetch updated user to return the new status
        const [updatedRows] = await pool.query('SELECT id, is_blocked FROM users WHERE id = ?', [id]);
        
        res.json({ 
            message: `User ${updatedRows[0].is_blocked ? 'blocked' : 'unblocked'} successfully`,
            id: Number(id),
            is_blocked: updatedRows[0].is_blocked
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
