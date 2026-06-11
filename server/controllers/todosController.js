const DBService = require('../services/DBService');
const BaseController = require('./BaseController');

class TodosController extends BaseController {
    constructor() {
        super(new DBService('todos'), 'Todo', 'user_id', { userId: 'user_id' });
    }

    create = async (req, res) => {
        const { user_id, title } = req.body;
        if (!user_id || !title) return res.status(400).json({ error: 'user_id and title are required' });
        
        req.body = { user_id, title, completed: false };
        await super.create(req, res);
    }
}

module.exports = new TodosController();
