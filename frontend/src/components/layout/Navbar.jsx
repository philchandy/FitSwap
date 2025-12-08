import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "../../styles/Navbar.css";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="top-navbar" aria-label="Secondary navigation">
      <div className="navbar-center">
        <ul className="navbar-links">
          <li className="navbar-link-mobile-only">
            <Link to="/dashboard" className={`navbar-link ${isActive("/dashboard") ? "active" : ""}`}>
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/workouts" className={`navbar-link ${isActive("/workouts") ? "active" : ""}`}>
              Log Workouts
            </Link>
          </li>
          <li>
            <Link to="/discover" className={`navbar-link ${isActive("/discover") ? "active" : ""}`}>
              Find Partners
            </Link>
          </li>
          <li className="navbar-link-mobile-only">
            <Link to="/sessions" className={`navbar-link ${isActive("/sessions") ? "active" : ""}`}>
              Sessions
            </Link>
          </li>
          <li>
            <Link to="/profile" className={`navbar-link ${isActive("/profile") ? "active" : ""}`}>
              Edit Profile
            </Link>
          </li>
        </ul>
      </div>

      <div className="navbar-profile">
        <div className="profile-dropdown">
          <button className="profile-button">
            <i className="bi bi-person-circle"></i>
            <span>{user?.name}</span>
            <i className="bi bi-chevron-down"></i>
          </button>
          <div className="profile-menu">
            <Link to="/profile" className="profile-menu-item">
              <i className="bi bi-person"></i>
              Profile
            </Link>
            <div className="profile-menu-divider"></div>
            <button onClick={handleLogout} className="profile-menu-item">
              <i className="bi bi-box-arrow-right"></i>
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
