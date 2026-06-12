import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function Register() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/register', { name, username, password });
      alert('ההרשמה בוצעה בהצלחה! כעת תוכל להתחבר.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'שגיאה בהרשמה');
    }
  };

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-6 col-lg-4">
          <div className="card shadow-sm border-0 rounded-3">
            <div className="card-body p-4 text-center">
              <h2 className="mb-4 fw-bold">הרשמה למערכת</h2>
              
              {error && <div className="alert alert-danger py-2">{error}</div>}
              
              <form onSubmit={handleRegister}>
                <div className="mb-3">
                  <input type="text" className="form-control" placeholder="שם מלא" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <input type="text" className="form-control" placeholder="שם משתמש" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
                <div className="mb-3">
                  <input type="password" className="form-control" placeholder="סיסמה" value={password} onChange={(e) => setPassword(e.target.value)} required />
                </div>
                <button type="submit" className="btn btn-success w-100 fw-bold">הירשם</button>
              </form>
              
              <div className="mt-3">
                <span className="text-muted">כבר יש לך חשבון? </span>
                <button className="btn btn-link p-0 text-decoration-none" onClick={() => navigate('/login')}>התחבר כאן</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
