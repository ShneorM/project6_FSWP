import { useState, useEffect, useContext } from 'react';
import TodoItem from '../components/TodoItem';
import { DataContext } from '../context/DataContext';

function Todos({ user }) {
  const { todos, todosError, fetchTodos, addTodo, updateTodo, deleteTodo } = useContext(DataContext);
  const [newTitle, setNewTitle] = useState('');
  const [localError, setLocalError] = useState('');

  const error = localError || todosError;

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setLocalError('');
    
    const result = await addTodo(newTitle);
    if (result.success) {
      setNewTitle('');
    } else {
      setLocalError(result.error);
    }
  };

  const handleToggle = async (todo) => {
    setLocalError('');
    const result = await updateTodo(todo.id, { completed: !todo.completed });
    if (!result.success) setLocalError(result.error);
  };

  const handleEdit = async (todo, newTitle) => {
    setLocalError('');
    const result = await updateTodo(todo.id, { title: newTitle });
    if (!result.success) setLocalError(result.error);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('למחוק את המשימה?')) return;
    setLocalError('');
    const result = await deleteTodo(id);
    if (!result.success) setLocalError(result.error);
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
