import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const Sessions = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all'); // 'all', 'scheduled', 'completed', 'cancelled'

  useEffect(() => {
    if (user) {
      fetchSessions();
    }
  }, [user, filter]);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const params = filter !== 'all' ? `?status=${filter}` : '';
      const response = await fetch(`/api/sessions/user/${user._id}${params}`);
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSessionStatus = async (sessionId, status) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchSessions(); //refresh
      } else {
        console.error('Error updating session status');
      }
    } catch (error) {
      console.error('Error updating session status:', error);
    }
  };

  const deleteSession = async (sessionId) => {
    if (window.confirm('Are you sure you want to cancel this session?')) {
      try {
        const response = await fetch(`/api/sessions/${sessionId}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          fetchSessions(); //refresh
        } else {
          console.error('Error deleting session');
        }
      } catch (error) {
        console.error('Error deleting session:', error);
      }
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'scheduled': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  if (!user) {
    return <div>Please log in to view your sessions.</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Training Sessions</h2>
        <Link to="/discover" className="btn btn-primary">
          Schedule New Session
        </Link>
      </div>

      {/* Filter Tabs */}
      <ul className="nav nav-pills mb-4">
        <li className="nav-item">
          <button
            className={`nav-link ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Sessions
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${filter === 'scheduled' ? 'active' : ''}`}
            onClick={() => setFilter('scheduled')}
          >
            Upcoming
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${filter === 'cancelled' ? 'active' : ''}`}
            onClick={() => setFilter('cancelled')}
          >
            Cancelled
          </button>
        </li>
      </ul>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-4">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {/* Sessions List */}
      {sessions.length === 0 && !loading ? (
        <div className="text-center py-5">
          <h4>No sessions found</h4>
          <p>
            {filter === 'all' 
              ? "You haven't scheduled any sessions yet." 
              : `No ${filter} sessions found.`
            }
          </p>
          <Link to="/discover" className="btn btn-primary">
            Find Training Partners
          </Link>
        </div>
      ) : (
        <div className="row">
          {sessions.map(session => (
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
  const isTrainer = session.trainerId === currentUser._id;
  const partner = isTrainer ? session.trainee : session.trainer;
  const role = isTrainer ? 'Trainer' : 'Trainee';

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'scheduled': return 'primary';
      case 'completed': return 'success';
      case 'cancelled': return 'danger';
      default: return 'secondary';
    }
  };

  const canMarkCompleted = session.status === 'scheduled' && 
                          new Date(session.date) <= new Date();

  return (
    <div className="col-md-6 col-lg-4 mb-4">
      <div className="card h-100">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <h5 className="card-title">{session.title}</h5>
            <span className={`badge bg-${getStatusBadgeColor(session.status)}`}>
              {session.status}
            </span>
          </div>

          <div className="mb-2">
            <strong>Role:</strong> <span className="badge bg-info">{role}</span>
          </div>

          <div className="mb-2">
            <strong>Partner:</strong> {partner?.name || 'Unknown'}
          </div>

          <div className="mb-2">
            <strong>Skill:</strong> <span className="badge bg-secondary">{session.skill}</span>
          </div>

          <div className="mb-2">
            <strong>Date:</strong> {formatDate(session.date)}
          </div>

          <div className="mb-2">
            <strong>Time:</strong> {formatTime(session.startTime)} - {formatTime(session.endTime)}
          </div>

          {session.location && (
            <div className="mb-2">
              <strong>Location:</strong> {session.location}
            </div>
          )}

          {session.notes && (
            <div className="mb-3">
              <strong>Notes:</strong> {session.notes}
            </div>
          )}

          {/* Action Buttons */}
          <div className="d-flex gap-2 flex-wrap">
            {session.status === 'scheduled' && (
              <>
                {canMarkCompleted && (
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => onStatusUpdate(session._id, 'completed')}
                  >
                    Mark Complete
                  </button>
                )}
                
                <button
                  className="btn btn-outline-danger btn-sm"
                  onClick={() => onDelete(session._id)}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sessions;