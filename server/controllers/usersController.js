const DBService = require('../services/DBService');
const BaseController = require('./BaseController');
const bcrypt = require('bcryptjs');
const pool = require('../config/db');

const passwordsService = new DBService('passwords', 'user_id');
const SALT_ROUNDS = 10;

class UsersController extends BaseController {
    constructor() {
        super(new DBService('users'), 'User', null, null);
    }

    // Override getAll to hide passwords (legacy safety)
    getAll = async (req, res) => {
        try {
            const rows = await this.service.find();
            const usersSafe = rows.map(u => {
                const { password, ...safeUser } = u;
                return safeUser;
            });
            res.json(usersSafe);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Override update to only allow changing 'name', prevent username/password injection
    update = async (req, res) => {
        const { id } = req.params;
        const { name, user_id } = req.body;

        // Verify the requesting user is updating their own profile
        if (user_id && String(user_id) !== String(id)) {
            return res.status(403).json({ error: 'Unauthorized: cannot update another user' });
        }

        if (!name || !name.trim()) {
            return res.status(400).json({ error: 'Name is required' });
        }

        try {
            // Only update the name field — username is immutable, password is in a separate table
            const [result] = await pool.query(
                'UPDATE users SET name = ? WHERE id = ?',
                [name.trim(), id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            res.json({ message: 'Profile updated successfully', id: Number(id), name: name.trim() });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    // Custom method: change password securely
    changePassword = async (req, res) => {
        const { id } = req.params;
        const { userId, currentPassword, newPassword } = req.body;

        // Verify the requesting user is changing their own password
        if (String(userId) !== String(id)) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current password and new password are required' });
        }

        if (newPassword.length < 3) {
            return res.status(400).json({ error: 'New password must be at least 3 characters' });
        }

        try {
            // 1. Fetch the existing hash from the passwords table
            const passwordRows = await passwordsService.find({ user_id: id });
            if (passwordRows.length === 0) {
                return res.status(404).json({ error: 'User password record not found' });
            }

            const storedHash = passwordRows[0].password;

            // 2. Verify the current password
            const isMatch = await bcrypt.compare(currentPassword, storedHash);
            if (!isMatch) {
                return res.status(401).json({ error: 'Current password is incorrect' });
            }

            // 3. Hash the new password
            const salt = await bcrypt.genSalt(SALT_ROUNDS);
            const newHash = await bcrypt.hash(newPassword, salt);

            // 4. Update the passwords table
            const [result] = await pool.query(
                'UPDATE passwords SET password = ? WHERE user_id = ?',
                [newHash, id]
            );

            if (result.affectedRows === 0) {
                return res.status(500).json({ error: 'Failed to update password' });
            }

            res.json({ message: 'Password changed successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new UsersController();
