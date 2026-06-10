import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Register from './Register';

function App() {
  return (
    <Router>
      <div style={{ padding: '20px', fontFamily: 'Arial' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          
          {/* הניתובים כעת מצביעים לקומפוננטות החדשות שיצרנו */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/users/:username/dashboard" element={<h2>האזור האישי (בקרוב נבנה את הדאשבורד!)</h2>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;