const DBService = require('../services/DBService');
const BaseController = require('./BaseController');

class AlbumsController extends BaseController {
    constructor() {
        super(new DBService('albums'), 'Album', 'user_id', { userId: 'user_id' });
    }

    create = async (req, res) => {
        const { user_id, title } = req.body;
        if (!user_id || !title) return res.status(400).json({ error: 'user_id and title are required' });
        
        await super.create(req, res);
    }
}

module.exports = new AlbumsController();
