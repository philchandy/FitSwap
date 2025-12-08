import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import "../../styles/Sessions.css";

const Sessions = () => {
  //console.log('Sessions component mounted');
  const { user } = useAuth();
  //console.log('User in Sessions:', user);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState("all");

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const params = filter !== "all" ? `?status=${filter}` : "";
      const response = await fetch(`/api/sessions/user/${user._id}${params}`);
      if (response.ok) {
        const data = await response.json();
        //console.log('Fetched sessions:', data);
        setSessions(data);
      }
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      setLoading(false);
    }
  }, [user, filter]);

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user, fetchSessions]);

  const updateSessionStatus = async (sessionId, status) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchSessions(); //refresh
      } else {
        console.error("Error updating session status");
      }
    } catch (error) {
      console.error("Error updating session status:", error);
    }
  };

  const deleteSession = async (sessionId) => {
    if (window.confirm("Are you sure you want to cancel this session?")) {
      try {
        const response = await fetch(`/api/sessions/${sessionId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          fetchSessions(); //refresh
        } else {
          console.error("Error deleting session");
        }
      } catch (error) {
        console.error("Error deleting session:", error);
      }
    }
  };

  if (!user) {
    return <div>Please log in to view your sessions.</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h2>My Training Sessions</h2>
        <Link to="/discover" className="btn log-workout-btn">
          Schedule New Session
        </Link>
      </div>
      <hr className="chart-divider" />

      <div className="chart-filters mb-4">
        <button
          className={`chart-filter-btn ${filter === "all" ? "active" : ""}`}
          onClick={() => setFilter("all")}
        >
          All Sessions
        </button>
        <button
          className={`chart-filter-btn ${filter === "scheduled" ? "active" : ""}`}
          onClick={() => setFilter("scheduled")}
        >
          Upcoming
        </button>
        <button
          className={`chart-filter-btn ${filter === "completed" ? "active" : ""}`}
          onClick={() => setFilter("completed")}
        >
          Completed
        </button>
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {sessions.length === 0 && !loading ? (
        <div className="sessions-empty-state">
          <h4>No sessions found</h4>
          <p>
            {filter === "all"
              ? "You haven't scheduled any sessions yet."
              : `No ${filter} sessions found.`}
          </p>
          <Link to="/discover" className="btn btn-primary">
            Find Training Partners
          </Link>
        </div>
      ) : (
        <div className="row">
          {sessions.map((session) => (
            <SessionCard
              key={session._id}
              session={session}
              currentUser={user}
              onStatusUpdate={updateSessionStatus}
              onDelete={deleteSession}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const SessionCard = ({ session, currentUser, onStatusUpdate, onDelete }) => {
  //console.log('SessionCard rendering with session:', session);
  const isTrainer = session.trainerId === currentUser._id;
  const partner = isTrainer ? session.trainee : session.trainer;
  const role = isTrainer ? "Trainer" : "Trainee";

  const formatDate = (date) => {
    //console.log('Raw date from backend:', date);
    //console.log('Date type:', typeof date);
    
    // The date is already an ISO string from MongoDB, just parse it directly
    const dateObj = new Date(date);
    //console.log('Date object created:', dateObj);
    
    const formatted = dateObj.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC"
    });
    //console.log('Formatted date:', formatted);
    
    return formatted;
  };

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const canMarkCompleted =
    session.status === "scheduled" && new Date(session.date) <= new Date();

  return (
    <div className="col-md-6 col-lg-4 mb-4">
      <div className="session-card">
        <div className="session-card-header">
          <p className="session-card-title">
            {session.title}
            <span className="session-role-badge">{role}</span>
          </p>
          <span
            className={`session-status-badge session-status-${session.status}`}
          >
            {session.status}
          </span>
        </div>

        <div className="session-card-body">
          <div className="session-stats">
            <div className="session-stat-item">
              <div className="session-stat-icon">
                <i className="bi bi-person-fill"></i>
              </div>
              <div className="session-stat-content">
                <div className="session-stat-label">Partner</div>
                <div className="session-stat-value">
                  {partner?.name || "Unknown"}
                </div>
              </div>
            </div>

            <div className="session-stat-item">
              <div className="session-stat-icon">
                <i className="bi bi-trophy-fill"></i>
              </div>
              <div className="session-stat-content">
                <div className="session-stat-label">Skill</div>
                <div className="session-stat-value">{session.skill}</div>
              </div>
            </div>
          </div>

          <div className="session-stats">
            <div className="session-stat-item">
              <div className="session-stat-icon">
                <i className="bi bi-calendar-fill"></i>
              </div>
              <div className="session-stat-content">
                <div className="session-stat-label">Date</div>
                <div className="session-stat-value-small">
                  {formatDate(session.date)}
                </div>
              </div>
            </div>
          </div>

          <div className="session-stats">
            <div className="session-stat-item">
              <div className="session-stat-icon">
                <i className="bi bi-clock-fill"></i>
              </div>
              <div className="session-stat-content">
                <div className="session-stat-label">Time</div>
                <div className="session-stat-value-small">
                  {formatTime(session.startTime)} -{" "}
                  {formatTime(session.endTime)}
                </div>
              </div>
            </div>
          </div>

          {session.location && (
            <div className="session-stats">
              <div className="session-stat-item">
                <div className="session-stat-icon">
                  <i className="bi bi-geo-alt-fill"></i>
                </div>
                <div className="session-stat-content">
                  <div className="session-stat-label">Location</div>
                  <div className="session-stat-value-small">
                    {session.location}
                  </div>
                </div>
              </div>
            </div>
          )}

          {session.notes && (
            <div className="session-notes">{session.notes}</div>
          )}

          {session.status === "scheduled" && (
            <div className="session-actions">
              {canMarkCompleted && (
                <button
                  className="btn btn-success"
                  onClick={() => onStatusUpdate(session._id, "completed")}
                >
                  <i className="bi bi-check-circle me-1"></i>
                  Mark Complete
                </button>
              )}

              <button
                className="btn btn-outline-danger"
                onClick={() => onDelete(session._id)}
              >
                <i className="bi bi-x-circle me-1"></i>
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sessions;
