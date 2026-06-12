import { Link, useNavigate } from 'react-router-dom';

function Navbar({ user }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div className="container">
        <span className="navbar-brand fw-bold">שלום, {user.name}</span>
        
        <div className="navbar-nav me-auto flex-row gap-3">
          <Link className="nav-link text-white" to={`/users/${user.username}/todos`}>משימות</Link>
          <Link className="nav-link text-white" to={`/users/${user.username}/posts`}>פוסטים</Link>
          <Link className="nav-link text-white" to={`/users/${user.username}/albums`}>אלבומים</Link>
          {user.is_admin && (
            <Link className="nav-link text-warning fw-bold" to={`/users/${user.username}/admin`}>🛡️ פאנל מנהל</Link>
          )}
        </div>

        <div className="d-flex gap-2">
          <Link className="btn btn-info text-white fw-bold" to={`/users/${user.username}/settings`}>הגדרות פרופיל</Link>
          <button className="btn btn-danger fw-bold" onClick={handleLogout}>התנתק</button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
