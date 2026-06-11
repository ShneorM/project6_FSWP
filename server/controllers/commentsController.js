const DBService = require('../services/DBService');
const BaseController = require('./BaseController');

class CommentsController extends BaseController {
    constructor() {
        super(new DBService('comments'), 'Comment', 'email', { postId: 'post_id' });
    }

    create = async (req, res) => {
        const { post_id, name, email, body } = req.body;
        if (!post_id || !name || !email || !body) return res.status(400).json({ error: 'All fields are required' });
        
        await super.create(req, res);
    }
}

module.exports = new CommentsController();
