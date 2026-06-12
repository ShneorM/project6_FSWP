import { useEffect, useState } from 'react';
import { useNavigate, Routes, Route, useParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Todos from './Todos';
import Posts from './Posts';

function Dashboard() {
  const navigate = useNavigate();
  const { username } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.username !== username) {
      navigate(`/users/${parsedUser.username}/posts`);
      return;
    }
    setUser(parsedUser);
  }, [navigate, username]);

  if (!user) return <div className="container mt-5 text-center"><div className="spinner-border text-primary"></div></div>;

  return (
    <div>
      <Navbar user={user} />

      <div className="container mt-4">
        <div className="bg-white p-4 rounded shadow-sm">
          <Routes>
            <Route path="/" element={<h3 className="text-center text-muted">ברוך הבא לאזור האישי! בחר מהתפריט למעלה.</h3>} />
            <Route path="todos" element={<Todos user={user} />} />
            <Route path="posts" element={<Posts user={user} />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
