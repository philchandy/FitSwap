import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "../../styles/Navbar.css";

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="top-navbar">
      <div className="navbar-center">
        <ul className="navbar-links">
          <li>
            <Link to="/workouts" className="navbar-link">
              Log Workouts
            </Link>
          </li>
          <li>
            <Link to="/discover" className="navbar-link">
              Find Partners
            </Link>
          </li>
          <li>
            <Link to="/profile" className="navbar-link">
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
