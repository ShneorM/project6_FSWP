const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const usersRoutes = require('./routes/usersRoutes');
const todosRoutes = require('./routes/todosRoutes');
const postsRoutes = require('./routes/postsRoutes');
const commentsRoutes = require('./routes/commentsRoutes'); // <--- שורה חדשה

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// ==========================================
// REST API Routes
// ==========================================

app.use('/api', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/todos', todosRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/comments', commentsRoutes); // <--- שורה חדשה

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});