import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import Profile from "./components/profile/Profile";
import Dashboard from "./components/dashboard/Dashboard";
import WorkoutLog from "./components/workouts/WorkoutLog";
import UserDiscovery from "./components/social/UserDiscovery";
import ScheduleSession from "./components/social/ScheduleSession";
import Sessions from "./components/social/Sessions";
import Navbar from "./components/layout/Navbar";
import Sidebar from "./components/layout/Sidebar";

function AppContent() {
  const location = useLocation();
  const isAuthPage =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <div className="App">
      {!isAuthPage && <Sidebar />}
      {!isAuthPage && <Navbar />}
      <main className={isAuthPage ? "" : "main-content"}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/workouts" element={<WorkoutLog />} />
          <Route path="/discover" element={<UserDiscovery />} />
          <Route
            path="/schedule-session/:userId"
            element={<ScheduleSession />}
          />
          <Route path="/sessions" element={<Sessions />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;
