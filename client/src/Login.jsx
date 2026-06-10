import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      // שליחת בקשת התחברות לשרת שלנו
      const response = await axios.post('http://localhost:3000/login', {
        username,
        password,
      });

      // אם הצלחנו, השרת יחזיר את פרטי המשתמש (ללא סיסמה).
      // נשמור אותם ב-Local Storage כדי שהמשתמש יישאר מחובר.
      localStorage.setItem('user', JSON.stringify(response.data));
      
      // נעביר את המשתמש לעמוד האזור האישי שלו
      navigate(`/users/${response.data.username}/dashboard`);
    } catch (err) {
      // אם השרת החזיר שגיאה (למשל 401: שם משתמש או סיסמה שגויים), נציג אותה
      setError(err.response?.data?.error || 'שגיאה בהתחברות');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
      <h2>התחברות למערכת</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input
          type="text"
          placeholder="שם משתמש"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="סיסמה"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">התחבר</button>
      </form>
      
      <p style={{ marginTop: '20px' }}>
        עדיין אין לך חשבון? <button onClick={() => navigate('/register')}>הירשם כאן</button>
      </p>
    </div>
  );
}

export default Login;