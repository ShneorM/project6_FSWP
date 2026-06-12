const DBService = require('../services/DBService');
const BaseController = require('./BaseController');
const pool = require('../config/db');

class PhotosController extends BaseController {
    constructor() {
        super(new DBService('photos'), 'Photo', null, { albumId: 'album_id' });
    }

    create = async (req, res) => {
        const { album_id, title, url, thumbnail_url, user_id } = req.body;
        if (!album_id || !title || !url || !thumbnail_url) {
            return res.status(400).json({ error: 'album_id, title, url, and thumbnail_url are required' });
        }

        // Verify the album belongs to the requesting user
        if (user_id) {
            const [albums] = await pool.query(
                'SELECT id FROM albums WHERE id = ? AND user_id = ? AND is_deleted = FALSE',
                [album_id, user_id]
            );
            if (albums.length === 0) {
                return res.status(403).json({ error: 'Album not found or unauthorized' });
            }
        }

        // Remove user_id from body before inserting (photos table doesn't have user_id)
        const { user_id: _, ...photoData } = req.body;
        req.body = photoData;
        await super.create(req, res);
    }

    update = async (req, res) => {
        const { id } = req.params;
        const { user_id } = req.body;

        if (!user_id) {
            return res.status(400).json({ error: 'Missing user_id for authorization' });
        }

        try {
            // Verify the photo belongs to an album owned by this user
            const [rows] = await pool.query(
                `SELECT p.id FROM photos p
                 JOIN albums a ON p.album_id = a.id
                 WHERE p.id = ? AND a.user_id = ? AND a.is_deleted = FALSE`,
                [id, user_id]
            );

            if (rows.length === 0) {
                return res.status(404).json({ error: 'Photo not found or unauthorized' });
            }

            // Remove user_id from the update data (photos table doesn't have user_id)
            const { user_id: _, ...updateData } = req.body;
            const keys = Object.keys(updateData);
            if (keys.length === 0) {
                return res.status(400).json({ error: 'No fields to update' });
            }

            const setClause = keys.map(k => `${k} = ?`).join(', ');
            const values = keys.map(k => updateData[k]);

            const [result] = await pool.query(
                `UPDATE photos SET ${setClause} WHERE id = ?`,
                [...values, id]
            );

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Photo not found' });
            }

            res.json({ message: 'Photo updated successfully', id, ...updateData });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    delete = async (req, res) => {
        const { id } = req.params;
        const { user_id } = req.body;

        if (!user_id) {
            return res.status(400).json({ error: 'Missing user_id for authorization' });
        }

        try {
            // Verify the photo belongs to an album owned by this user
            const [rows] = await pool.query(
                `SELECT p.id FROM photos p
                 JOIN albums a ON p.album_id = a.id
                 WHERE p.id = ? AND a.user_id = ? AND a.is_deleted = FALSE`,
                [id, user_id]
            );

            if (rows.length === 0) {
                return res.status(404).json({ error: 'Photo not found or unauthorized' });
            }

            const [result] = await pool.query('DELETE FROM photos WHERE id = ?', [id]);

            if (result.affectedRows === 0) {
                return res.status(404).json({ error: 'Photo not found' });
            }

            res.json({ message: 'Photo deleted successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
}

module.exports = new PhotosController();
