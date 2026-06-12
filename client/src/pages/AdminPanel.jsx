import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function AdminPanel({ user }) {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  // Frontend guard: redirect non-admins
  useEffect(() => {
    if (!user.is_admin) {
      navigate(`/users/${user.username}/posts`);
    }
  }, [user, navigate]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get(`/admin/users?adminUserId=${user.id}`);
        setUsers(response.data);
        setError('');
      } catch (err) {
        setError(err.response?.data?.error || 'שגיאה בטעינת נתוני המשתמשים');
      } finally {
        setLoading(false);
      }
    };
    if (user.is_admin) fetchUsers();
  }, [user]);

  const handleToggleBlock = async (targetUserId) => {
    setError('');
    try {
      const response = await api.put(`/admin/users/${targetUserId}/toggle-block`, { adminUserId: user.id });
      setUsers((prev) =>
        prev.map(u => u.id === targetUserId ? { ...u, is_blocked: response.data.is_blocked } : u)
      );
    } catch (err) {
      setError(err.response?.data?.error || 'שגיאה בשינוי סטטוס החסימה');
    }
  };

  if (!user.is_admin) return null;

  if (loading) {
    return <div className="text-center mt-5"><div className="spinner-border text-primary"></div></div>;
  }

  return (
    <div>
      <h3 className="text-center text-danger mb-4">🛡️ פאנל ניהול מערכת</h3>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="table-responsive">
        <table className="table table-hover table-bordered align-middle">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>שם מלא</th>
              <th>שם משתמש</th>
              <th>פוסטים</th>
              <th>משימות</th>
              <th>מנהל</th>
              <th>סטטוס</th>
              <th>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className={u.is_blocked ? 'table-danger' : ''}>
                <td>{u.id}</td>
                <td>{u.name}</td>
                <td className="fw-bold">{u.username}</td>
                <td><span className="badge bg-info">{u.post_count}</span></td>
                <td><span className="badge bg-secondary">{u.todo_count}</span></td>
                <td>
                  {u.is_admin ? (
                    <span className="badge bg-warning text-dark">מנהל</span>
                  ) : (
                    <span className="badge bg-light text-muted">רגיל</span>
                  )}
                </td>
                <td>
                  {u.is_blocked ? (
                    <span className="badge bg-danger">חסום</span>
                  ) : (
                    <span className="badge bg-success">פעיל</span>
                  )}
                </td>
                <td>
                  {u.id === user.id ? (
                    <span className="text-muted small">אתה</span>
                  ) : (
                    <button
                      className={`btn btn-sm fw-bold ${u.is_blocked ? 'btn-success' : 'btn-danger'}`}
                      onClick={() => handleToggleBlock(u.id)}
                    >
                      {u.is_blocked ? '🔓 שחרר חסימה' : '🔒 חסום משתמש'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="alert alert-info mt-3">
        <strong>💡 מידע:</strong> משתמש חסום לא יוכל להתחבר למערכת. ניתן לשחרר חסימה בכל עת.
      </div>
    </div>
  );
}

export default AdminPanel;
