const DBService = require('../services/DBService');
const usersService = new DBService('users');

exports.login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const users = await usersService.find({ username, password });
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        const user = users[0];
        delete user.password;
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.register = async (req, res) => {
    const { name, username, password } = req.body;
    try {
        const result = await usersService.create({ name, username, password });
        res.status(201).json({ id: result.id, name, username });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Username already exists' });
        }
        res.status(500).json({ error: error.message });
    }
};
