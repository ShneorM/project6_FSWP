const mysql = require('mysql2/promise');

// יצירת חיבור (Pool) למסד הנתונים
// שימוש ב-Pool עדיף כי הוא מנהל מספר חיבורים במקביל ביעילות
const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '1234', // <-- שנה כאן אם הסיסמה שלך ל-MySQL שונה
    database: 'fullstack_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// בדיקת חיבור ראשונית כדי לוודא שהכל עובד כשהשרת עולה
pool.getConnection()
    .then(connection => {
        console.log('Connected to MySQL database successfully!');
        connection.release();
    })
    .catch(err => {
        console.error('Error connecting to MySQL:', err);
    });

module.exports = pool;