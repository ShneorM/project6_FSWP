import { useState, useEffect } from 'react';
import api from '../services/api';
import TodoItem from '../components/TodoItem';

function Todos({ user }) {
  const [todos, setTodos] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchTodos();
  }, [user]);

  const fetchTodos = async () => {
    try {
      const response = await api.get(`/todos?userId=${user.id}`);
      setTodos(response.data);
    } catch (err) {
      setError('שגיאה בטעינת משימות');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      const response = await api.post('/todos', { user_id: user.id, title: newTitle });
      setTodos([...todos, response.data]);
      setNewTitle('');
    } catch (err) {
      setError('שגיאה ביצירת משימה');
    }
  };

  const handleToggle = async (todo) => {
    try {
      const updated = { ...todo, completed: !todo.completed };
      await api.put(`/todos/${todo.id}`, { ...updated, user_id: user.id });
      setTodos(todos.map(t => t.id === todo.id ? updated : t));
    } catch (err) {
      setError('שגיאה בעדכון משימה');
    }
  };

  const handleEdit = async (todo, newTitle) => {
    try {
      const updated = { ...todo, title: newTitle };
      await api.put(`/todos/${todo.id}`, { ...updated, user_id: user.id });
      setTodos(todos.map(t => t.id === todo.id ? updated : t));
    } catch (err) {
      setError('שגיאה בעדכון משימה');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('למחוק את המשימה?')) return;
    try {
      await api.delete(`/todos/${id}`, { data: { user_id: user.id } });
      setTodos(todos.filter(t => t.id !== id));
    } catch (err) {
      setError('שגיאה במחיקת משימה');
    }
  };

  return (
    <div>
      <h3 className="text-center text-primary mb-4">ניהול משימות</h3>
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form onSubmit={handleCreate} className="d-flex mb-4 gap-2">
        <input 
          type="text" 
          className="form-control" 
          placeholder="הכנס משימה חדשה..." 
          value={newTitle} 
          onChange={(e) => setNewTitle(e.target.value)} 
        />
        <button type="submit" className="btn btn-success fw-bold">הוסף</button>
      </form>

      <div className="bg-light p-3 rounded">
        {todos.length === 0 ? (
          <p className="text-center text-muted mb-0">אין משימות עדיין.</p>
        ) : (
          todos.map(todo => (
            <TodoItem 
              key={todo.id} 
              todo={todo} 
              onToggle={handleToggle} 
              onDelete={handleDelete} 
              onEdit={handleEdit}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default Todos;
