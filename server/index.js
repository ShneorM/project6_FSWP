const express = require('express');
const cors = require('cors');
const pool = require('./db'); // ייבוא החיבור למסד הנתונים שלנו

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// ==========================================
// REST API Routes
// ==========================================

// 1. קבלת כל המשתמשים (ללא הסיסמאות מטעמי אבטחה)
app.get('/users', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT id, name, username FROM users');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 2. קבלת כל הפוסטים (כולל שם המחבר שלהם)
app.get('/posts', async (req, res) => {
    try {
        const [rows] = await pool.query(`
            SELECT posts.id, posts.title, posts.body, users.username AS author
            FROM posts
            JOIN users ON posts.user_id = users.id
        `);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 3. הוספת משימה חדשה (POST)
app.post('/todos', async (req, res) => {
    const { user_id, title } = req.body;
    
    // ולידציה בסיסית - לוודא שקיבלנו את הנתונים הנדרשים
    if (!user_id || !title) {
        return res.status(400).json({ error: 'user_id and title are required' });
    }

    try {
        const [result] = await pool.query(
            'INSERT INTO todos (user_id, title) VALUES (?, ?)', 
            [user_id, title]
        );
        // מחזירים את המשימה שנוצרה עם ה-ID החדש ש-MySQL ייצר עבורה
        res.status(201).json({ id: result.insertId, user_id, title, completed: false });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// 4. עדכון משימה (PUT) - למשל שינוי סטטוס הביצוע או הכותרת
app.put('/todos/:id', async (req, res) => {
    const { id } = req.params; // שולף את המזהה מתוך שורת הכתובת
    const { title, completed } = req.body; // שולף את הנתונים המעודכנים מגוף הבקשה

    try {
        const [result] = await pool.query(
            'UPDATE todos SET title = ?, completed = ? WHERE id = ?',
            [title, completed, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Todo not found' });
        }

        res.json({ message: 'Todo updated successfully', id, title, completed });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 5. מחיקת משימה (DELETE)
app.delete('/todos/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [result] = await pool.query('DELETE FROM todos WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Todo not found' });
        }

        res.json({ message: 'Todo deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 6. התחברות משתמש קיים (Login)
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        // בודקים אם יש משתמש כזה בבסיס הנתונים
        const [users] = await pool.query('SELECT * FROM users WHERE username = ? AND password = ?', [username, password]);
        
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }
        
        const user = users[0];
        delete user.password; // מוחקים את הסיסמה מהאובייקט כדי לא לשלוח אותה בחזרה ללקוח!
        res.json(user); // שולחים את פרטי המשתמש המורשה
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// 7. הרשמת משתמש חדש (Register)
app.post('/register', async (req, res) => {
    const { name, username, password } = req.body;
    try {
        const [result] = await pool.query(
            'INSERT INTO users (name, username, password) VALUES (?, ?, ?)',
            [name, username, password]
        );
        res.status(201).json({ id: result.insertId, name, username });
    } catch (error) {
        // שגיאה 1062 ב-MySQL אומרת שיש כפילות (שם המשתמש כבר תפוס)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ error: 'Username already exists' });
        }
        res.status(500).json({ error: error.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});