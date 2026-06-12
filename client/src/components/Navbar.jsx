import { Link, useNavigate } from 'react-router-dom';

function Navbar({ user }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  const handleInfo = () => {
    alert(`פרטי המשתמש:\nשם מלא: ${user.name}\nשם משתמש: ${user.username}\nמזהה מערכת (ID): ${user.id}`);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary shadow-sm">
      <div className="container">
        <span className="navbar-brand fw-bold">שלום, {user.name}</span>
        
        <div className="navbar-nav me-auto flex-row gap-3">
          <Link className="nav-link text-white" to={`/users/${user.username}/todos`}>משימות</Link>
          <Link className="nav-link text-white" to={`/users/${user.username}/posts`}>פוסטים</Link>
        </div>

        <div className="d-flex gap-2">
          <button className="btn btn-info text-white fw-bold" onClick={handleInfo}>מידע אישי</button>
          <button className="btn btn-danger fw-bold" onClick={handleLogout}>התנתק</button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
