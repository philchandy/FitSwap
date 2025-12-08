import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import "../../styles/Sidebar.css";

const Sidebar = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return null;
  }

  const isActive = (path) => location.pathname === path;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <h1 className="sidebar-title">
          FITSW
          <img src="/logo.svg" alt="" className="logo-inline" />P
        </h1>
      </div>
      <hr className="sidebar-divider" />
      <nav className="sidebar-nav" aria-label="Main navigation">
        <ul className="sidebar-menu">
          <li
            className={`sidebar-item ${isActive("/dashboard") ? "active" : ""}`}
          >
            <Link to="/dashboard" className="sidebar-link">
              <i className="bi bi-view-stacked"></i>
              <span>Dashboard</span>
            </Link>
          </li>
          <li
            className={`sidebar-item ${isActive("/workouts") ? "active" : ""}`}
          >
            <Link to="/workouts" className="sidebar-link">
              <i className="bi bi-activity"></i>
              <span>Workouts</span>
            </Link>
          </li>
          <li
            className={`sidebar-item ${isActive("/sessions") ? "active" : ""}`}
          >
            <Link to="/sessions" className="sidebar-link">
              <i className="bi bi-calendar-check"></i>
              <span>Sessions</span>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
