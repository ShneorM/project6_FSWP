import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

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
      // שליחת בקשת הרשמה לשרת
      await axios.post('http://localhost:3000/register', {
        name,
        username,
        password,
      });

      // אם ההרשמה הצליחה, נעביר את המשתמש לעמוד ההתחברות
      alert('ההרשמה בוצעה בהצלחה! כעת תוכל להתחבר.');
      navigate('/login');
    } catch (err) {
      // אם יש שגיאה (למשל, שם המשתמש כבר קיים)
      setError(err.response?.data?.error || 'שגיאה בהרשמה');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
      <h2>הרשמה למערכת</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      
      <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input
          type="text"
          placeholder="שם מלא"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
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
        <button type="submit">הירשם</button>
      </form>
      
      <p style={{ marginTop: '20px' }}>
        כבר יש לך חשבון? <button onClick={() => navigate('/login')}>התחבר כאן</button>
      </p>
    </div>
  );
}

export default Register;