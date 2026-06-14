import { useState, useEffect } from 'react';
import api from '../services/api';

function PostComments({ postId, user }) {
  const [comments, setComments] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);

  // States for inline editing
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editBody, setEditBody] = useState('');

  const userEmail = `${user.username}@example.com`;

  const fetchComments = async () => {
    try {
      const response = await api.get(`/comments?postId=${postId}`);
      setComments(response.data);
    } catch {
      console.error('Error fetching comments');
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    
    setLoading(true);
    try {
      const newCommentData = {
        post_id: postId,
        name: user.name || user.username,
        email: userEmail,
        body: body
      };
      const response = await api.post('/comments', newCommentData);
      setComments([...comments, response.data]);
      setBody('');
    } catch {
      console.error('Error adding comment');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('למחוק את התגובה?')) return;
    try {
      await api.delete(`/comments/${commentId}`, { data: { email: userEmail } });
      setComments(comments.filter(c => c.id !== commentId));
    } catch {
      alert('שגיאה במחיקת התגובה');
    }
  };

  const startEditing = (comment) => {
    setEditingCommentId(comment.id);
    setEditBody(comment.body);
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditBody('');
  };

  const handleSaveEdit = async (commentId) => {
    if (!editBody.trim()) return;
    try {
      await api.put(`/comments/${commentId}`, { email: userEmail, body: editBody });
      setComments(comments.map(c => c.id === commentId ? { ...c, body: editBody } : c));
      setEditingCommentId(null);
    } catch {
      alert('שגיאה בעדכון התגובה');
    }
  };

  return (
    <div className="mt-3">
      <button 
        className="btn btn-sm btn-outline-secondary" 
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? 'הסתר תגובות' : `הצג תגובות ${comments.length > 0 ? `(${comments.length})` : ''}`}
      </button>

      {isOpen && (
        <div className="mt-3 p-3 bg-light rounded border">
          <h6 className="text-muted mb-3">תגובות:</h6>
          
          {comments.length === 0 ? (
            <p className="text-muted small">אין תגובות לפוסט זה. היה הראשון להגיב!</p>
          ) : (
            <ul className="list-group list-group-flush mb-3">
              {comments.map((comment) => {
                const isOwner = comment.email === userEmail;
                const isEditing = editingCommentId === comment.id;

                return (
                  <li key={comment.id} className="list-group-item bg-transparent px-0 py-2">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <strong className="small text-primary">{comment.name}</strong>
                      {isOwner && !isEditing && (
                        <div>
                          <button className="btn btn-sm btn-link text-secondary p-0 me-2 text-decoration-none" title="Edit" onClick={() => startEditing(comment)}>
                            Edit
                          </button>
                          <button className="btn btn-sm btn-link text-danger p-0 text-decoration-none" title="Delete" onClick={() => handleDeleteComment(comment.id)}>
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {isEditing ? (
                      <div className="d-flex gap-2 mt-1">
                        <input 
                          type="text" 
                          className="form-control form-control-sm" 
                          value={editBody} 
                          onChange={(e) => setEditBody(e.target.value)} 
                          autoFocus
                        />
                        <button className="btn btn-sm btn-success px-2" onClick={() => handleSaveEdit(comment.id)}>Save</button>
                        <button className="btn btn-sm btn-secondary px-2" onClick={cancelEditing}>Cancel</button>
                      </div>
                    ) : (
                      <p className="mb-0 small">{comment.body}</p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}

          <form onSubmit={handleAddComment} className="d-flex gap-2 mt-2 pt-2 border-top">
            <input 
              type="text" 
              className="form-control form-control-sm" 
              placeholder="כתוב תגובה..." 
              value={body}
              onChange={(e) => setBody(e.target.value)}
              disabled={loading}
            />
            <button type="submit" className="btn btn-sm btn-primary" disabled={loading || !body.trim()}>
              שלח
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default PostComments;
