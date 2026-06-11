const DBService = require('../services/DBService');
const BaseController = require('./BaseController');

class UsersController extends BaseController {
    constructor() {
        super(new DBService('users'), 'User', null, null);
    }

    // Override getAll to hide passwords
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
}

module.exports = new UsersController();
