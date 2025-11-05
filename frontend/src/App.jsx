import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Import components (we'll create these next)
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Profile from './components/profile/Profile';
import Dashboard from './components/dashboard/Dashboard';
import WorkoutLog from './components/workouts/WorkoutLog';
import Navbar from './components/layout/Navbar';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="container mt-4">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/workouts" element={<WorkoutLog />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App
