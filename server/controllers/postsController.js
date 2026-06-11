const DBService = require('../services/DBService');
const BaseController = require('./BaseController');

class PostsController extends BaseController {
    constructor() {
        super(new DBService('posts'), 'Post', 'user_id', { userId: 'user_id' });
    }

    create = async (req, res) => {
        const { user_id, title, body } = req.body;
        if (!user_id || !title || !body) return res.status(400).json({ error: 'user_id, title, and body are required' });
        
        await super.create(req, res);
    }
}

module.exports = new PostsController();
