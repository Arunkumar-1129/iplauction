import { Navigate, Route, Routes } from 'react-router-dom';
import Login from './pages/Login.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import AuctionRoom from './pages/AuctionRoom.jsx';
import TeamDashboard from './pages/TeamDashboard.jsx';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/auction" element={<AuctionRoom />} />
      <Route path="/team" element={<TeamDashboard />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
