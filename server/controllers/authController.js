const bcrypt = require('bcryptjs');
const DBService = require('../services/DBService');

const usersService = new DBService('users');
const passwordsService = new DBService('passwords', 'user_id');

const SALT_ROUNDS = 10;

exports.register = async (req, res) => {
    const { name, username, password } = req.body;

    if (!name || !username || !password) {
        return res.status(400).json({ error: 'Name, username, and password are required' });
    }

    try {
        // 1. Hash the password
        const salt = await bcrypt.genSalt(SALT_ROUNDS);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 2. Insert user details into the 'users' table
        const newUser = await usersService.create({ name, username });
        const userId = newUser.id;

        // 3. Insert the hashed password into the 'passwords' table
        await passwordsService.create({ user_id: userId, password: hashedPassword });

        // Return user info without the password
        res.status(201).json({ id: userId, name, username });
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Username already exists' });
        }
        res.status(500).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    try {
        // 1. Find the user by username in the 'users' table
        const users = await usersService.find({ username });
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        const user = users[0];

        // 2. Check if the user is blocked
        if (user.is_blocked) {
            return res.status(403).json({ error: 'החשבון שלך נחסם על ידי מנהל המערכת' });
        }

        // 3. Fetch the hashed password from the 'passwords' table
        const passwordRows = await passwordsService.find({ user_id: user.id });
        if (passwordRows.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        const hashedPassword = passwordRows[0].password;

        // 4. Compare the provided password with the hash
        const isMatch = await bcrypt.compare(password, hashedPassword);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        // Return user info with admin/blocked status, without the password
        res.json({ 
            id: user.id, 
            name: user.name, 
            username: user.username,
            is_admin: !!user.is_admin,
            is_blocked: !!user.is_blocked
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
