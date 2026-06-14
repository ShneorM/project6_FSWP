import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function Settings({ user, onUserUpdate }) {
  const navigate = useNavigate();

  // Profile form
  const [name, setName] = useState(user.name);
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');

  // Password form
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setProfileMsg('');
    setProfileError('');

    if (!name.trim()) {
      setProfileError('שם מלא הוא שדה חובה');
      return;
    }

    try {
      await api.put(`/users/${user.id}`, { name: name.trim(), user_id: user.id });
      // Update localStorage with the new name
      const updatedUser = { ...user, name: name.trim() };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      if (onUserUpdate) onUserUpdate(updatedUser);
      setProfileMsg('הפרופיל עודכן בהצלחה!');
    } catch (err) {
      setProfileError(err.response?.data?.error || 'שגיאה בעדכון הפרופיל');
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setPasswordMsg('');
    setPasswordError('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('כל השדות הם חובה');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('הסיסמה החדשה ואימות הסיסמה לא תואמים');
      return;
    }

    if (newPassword.length < 3) {
      setPasswordError('הסיסמה החדשה חייבת להיות לפחות 3 תווים');
      return;
    }

    try {
      await api.post(`/users/${user.id}/change-password`, {
        userId: user.id,
        currentPassword,
        newPassword
      });

      setPasswordMsg('הסיסמה שונתה בהצלחה! מתנתק...');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      // Log the user out after a short delay to force re-login with new password
      setTimeout(() => {
        localStorage.removeItem('user');
        navigate('/login');
      }, 2000);
    } catch (err) {
      setPasswordError(err.response?.data?.error || 'שגיאה בשינוי הסיסמה');
    }
  };

  return (
    <div>
      <h3 className="text-center text-primary mb-4">⚙️ הגדרות פרופיל</h3>

      {/* Form 1: Update Profile */}
      <div className="card shadow-sm mb-4 border-primary border-2">
        <div className="card-header bg-primary text-white fw-bold">עדכון פרטים אישיים</div>
        <div className="card-body">
          {profileMsg && <div className="alert alert-success py-2">{profileMsg}</div>}
          {profileError && <div className="alert alert-danger py-2">{profileError}</div>}

          <form onSubmit={handleUpdateProfile}>
            <div className="mb-3">
              <label className="form-label fw-bold">שם מלא</label>
              <input
                type="text"
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold">שם משתמש</label>
              <input
                type="text"
                className="form-control"
                value={user.username}
                disabled
              />
              <small className="text-muted">שם המשתמש אינו ניתן לשינוי</small>
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold">מזהה מערכת (ID)</label>
              <input
                type="text"
                className="form-control"
                value={user.id}
                disabled
              />
            </div>
            <button type="submit" className="btn btn-primary fw-bold">שמור שינויים</button>
          </form>
        </div>
      </div>

      {/* Form 2: Change Password */}
      <div className="card shadow-sm border-warning border-2">
        <div className="card-header bg-warning text-dark fw-bold">🔒 שינוי סיסמה</div>
        <div className="card-body">
          {passwordMsg && <div className="alert alert-success py-2">{passwordMsg}</div>}
          {passwordError && <div className="alert alert-danger py-2">{passwordError}</div>}

          <form onSubmit={handleChangePassword}>
            <div className="mb-3">
              <label className="form-label fw-bold">סיסמה נוכחית</label>
              <input
                type="password"
                className="form-control"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="הכנס את הסיסמה הנוכחית"
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold">סיסמה חדשה</label>
              <input
                type="password"
                className="form-control"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="הכנס סיסמה חדשה"
              />
            </div>
            <div className="mb-3">
              <label className="form-label fw-bold">אימות סיסמה חדשה</label>
              <input
                type="password"
                className="form-control"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="הכנס שוב את הסיסמה החדשה"
              />
            </div>
            <button type="submit" className="btn btn-warning fw-bold">שנה סיסמה</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Settings;
