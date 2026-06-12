import { useState, useEffect } from 'react';
import api from '../services/api';
import PostComments from '../components/PostComments';

function Posts({ user }) {
  const [posts, setPosts] = useState([]);
  const [usersMap, setUsersMap] = useState({});
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  
  // States for inline editing
  const [editingPostId, setEditingPostId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editBody, setEditBody] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [postsRes, usersRes] = await Promise.all([
        api.get('/posts'),
        api.get('/users')
      ]);
      
      const uMap = {};
      usersRes.data.forEach(u => { uMap[u.id] = u.username; });
      setUsersMap(uMap);
      setPosts(postsRes.data);
    } catch (err) {
      setError('שגיאה בטעינת נתונים');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    try {
      const response = await api.post('/posts', { user_id: user.id, title, body });
      setPosts([...posts, response.data]);
      setTitle('');
      setBody('');
    } catch (err) {
      setError('שגיאה ביצירת פוסט');
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm('האם אתה בטוח שברצונך למחוק פוסט זה?')) return;
    try {
      await api.delete(`/posts/${postId}`, { data: { user_id: user.id } });
      setPosts(posts.filter(p => p.id !== postId));
    } catch (err) {
      alert('שגיאה במחיקת הפוסט');
    }
  };

  const startEditing = (post) => {
    setEditingPostId(post.id);
    setEditTitle(post.title);
    setEditBody(post.body);
  };

  const cancelEditing = () => {
    setEditingPostId(null);
    setEditTitle('');
    setEditBody('');
  };

  const handleSaveEdit = async (postId) => {
    try {
      const response = await api.put(`/posts/${postId}`, { user_id: user.id, title: editTitle, body: editBody });
      setPosts(posts.map(p => p.id === postId ? { ...p, title: editTitle, body: editBody } : p));
      setEditingPostId(null);
    } catch (err) {
      alert('שגיאה בעדכון הפוסט');
    }
  };

  return (
    <div>
      <h3 className="text-center text-success mb-4">הפוסטים במערכת</h3>
      {error && <div className="alert alert-danger">{error}</div>}
      
      <form onSubmit={handleCreate} className="bg-light p-3 rounded mb-4 shadow-sm border border-primary border-opacity-25">
        <h5 className="mb-3 text-primary">יצירת פוסט חדש</h5>
        <div className="mb-2">
          <input 
            type="text" 
            className="form-control" 
            placeholder="כותרת הפוסט" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
          />
        </div>
        <div className="mb-3">
          <textarea 
            className="form-control" 
            placeholder="תוכן הפוסט" 
            rows="3"
            value={body} 
            onChange={(e) => setBody(e.target.value)} 
          ></textarea>
        </div>
        <button type="submit" className="btn btn-primary fw-bold">פרסם פוסט</button>
      </form>

      <div className="row g-3">
        {posts.length === 0 ? (
          <p className="text-center text-muted w-100">אין פוסטים עדיין.</p>
        ) : (
          posts.map(post => {
            const isOwner = post.user_id === user.id;
            const authorName = usersMap[post.user_id] || 'משתמש לא ידוע';
            const isEditing = editingPostId === post.id;

            return (
              <div className="col-12 col-md-6" key={post.id}>
                <div className={`card h-100 shadow-sm border ${isOwner ? 'border-primary border-2' : 'border-0'}`}>
                  {isOwner && <div className="card-header bg-primary text-white py-1 px-2 small fw-bold">הפוסט שלך</div>}
                  <div className="card-body d-flex flex-column position-relative">
                    
                    {isOwner && !isEditing && (
                      <div className="position-absolute top-0 end-0 p-2">
                        <button className="btn btn-sm btn-link text-secondary p-0 me-2" title="ערוך" onClick={() => startEditing(post)}>
                          ✏️
                        </button>
                        <button className="btn btn-sm btn-link text-danger p-0" title="מחק" onClick={() => handleDeletePost(post.id)}>
                          🗑️
                        </button>
                      </div>
                    )}

                    {isEditing ? (
                      <div className="mb-3">
                        <input 
                          className="form-control mb-2 fw-bold text-primary" 
                          value={editTitle} 
                          onChange={(e) => setEditTitle(e.target.value)} 
                        />
                        <textarea 
                          className="form-control mb-2" 
                          rows="3" 
                          value={editBody} 
                          onChange={(e) => setEditBody(e.target.value)}
                        ></textarea>
                        <div className="d-flex gap-2">
                          <button className="btn btn-success btn-sm flex-grow-1" onClick={() => handleSaveEdit(post.id)}>שמור שינויים</button>
                          <button className="btn btn-secondary btn-sm flex-grow-1" onClick={cancelEditing}>ביטול</button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h5 className="card-title text-primary pe-4">{post.title}</h5>
                        <h6 className="card-subtitle mb-2 text-muted">מאת: {authorName}</h6>
                        <p className="card-text flex-grow-1">{post.body}</p>
                      </>
                    )}
                    
                    <hr className="my-2" />
                    <PostComments postId={post.id} user={user} />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default Posts;
