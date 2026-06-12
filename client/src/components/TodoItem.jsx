import { useState } from 'react';

function TodoItem({ todo, onToggle, onDelete, onEdit }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);

  const handleSave = () => {
    if (!editTitle.trim()) return;
    onEdit(todo, editTitle);
    setIsEditing(false);
  };

  return (
    <div className="d-flex align-items-center justify-content-between p-2 border-bottom">
      {isEditing ? (
        <div className="d-flex gap-2 flex-grow-1 me-3">
          <input 
            type="text" 
            className="form-control form-control-sm" 
            value={editTitle} 
            onChange={(e) => setEditTitle(e.target.value)} 
            autoFocus
          />
          <button className="btn btn-sm btn-success" onClick={handleSave}>✓</button>
          <button className="btn btn-sm btn-secondary" onClick={() => { setIsEditing(false); setEditTitle(todo.title); }}>✕</button>
        </div>
      ) : (
        <div className="d-flex align-items-center flex-grow-1">
          <input 
            type="checkbox" 
            checked={todo.completed} 
            onChange={() => onToggle(todo)} 
            className="me-2 form-check-input mt-0"
            style={{ width: '1.2em', height: '1.2em', cursor: 'pointer' }}
          />
          <span 
            className="flex-grow-1 ms-2"
            style={{ 
              textDecoration: todo.completed ? 'line-through' : 'none',
              color: todo.completed ? '#6c757d' : 'inherit',
              cursor: 'pointer'
            }}
            onClick={() => setIsEditing(true)}
          >
            {todo.title}
          </span>
        </div>
      )}
      
      {!isEditing && (
        <div className="d-flex gap-2 ms-2 flex-shrink-0">
          <button className="btn btn-sm btn-outline-secondary" onClick={() => setIsEditing(true)} title="ערוך">✏️</button>
          <button className="btn btn-sm btn-outline-danger" onClick={() => onDelete(todo.id)} title="מחק">🗑️</button>
        </div>
      )}
    </div>
  );
}

export default TodoItem;
