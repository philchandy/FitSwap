import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const UserDiscovery = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState({
    skill: '',
    location: ''
  });
  const [activeTab, setActiveTab] = useState('discover'); //set to discover or matches

  const availableSkills = [
    'Weightlifting', 'Cardio', 'Yoga', 'Boxing', 'Running', 
    'Swimming', 'Cycling', 'CrossFit', 'Pilates', 'Rock Climbing'
  ];

  useEffect(() => {
    if (user) {
      if (activeTab === 'discover') {
        fetchUsers();
      } else {
        fetchMatches();
      }
    }
  }, [user, filter, activeTab]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.skill) params.append('skill', filter.skill);
      if (filter.location) params.append('location', filter.location);
      
      const response = await fetch(`/api/discover/discover/${user._id}?${params}`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMatches = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/discover/matches/${user._id}`);
      if (response.ok) {
        const data = await response.json();
        setMatches(data);
      }
    } catch (error) {
      console.error('Error fetching matches:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    setFilter({
      ...filter,
      [e.target.name]: e.target.value
    });
  };

  const clearFilters = () => {
    setFilter({ skill: '', location: '' });
  };

  if (!user) {
    return <div>Please log in to discover other users.</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Find Workout Partners</h2>
        
        {/* Tab Navigation */}
        <ul className="nav nav-pills">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'discover' ? 'active' : ''}`}
              onClick={() => setActiveTab('discover')}
            >
              Discover Users
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === 'matches' ? 'active' : ''}`}
              onClick={() => setActiveTab('matches')}
            >
              My Matches
            </button>
          </li>
        </ul>
      </div>

      {/* Filters (only show for discover tab) */}
      {activeTab === 'discover' && (
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title">Filters</h5>
            <div className="row">
              <div className="col-md-4">
                <label htmlFor="skill" className="form-label">Skill</label>
                <select
                  className="form-select"
                  id="skill"
                  name="skill"
                  value={filter.skill}
                  onChange={handleFilterChange}
                >
                  <option value="">All Skills</option>
                  {availableSkills.map(skill => (
                    <option key={skill} value={skill}>
                      {skill}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="col-md-4">
                <label htmlFor="location" className="form-label">Location</label>
                <input
                  type="text"
                  className="form-control"
                  id="location"
                  name="location"
                  value={filter.location}
                  onChange={handleFilterChange}
                  placeholder="City, State"
                />
              </div>
              
              <div className="col-md-4 d-flex align-items-end">
                <button
                  className="btn btn-outline-secondary"
                  onClick={clearFilters}
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-4">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {/* Users Grid */}
      <div className="row">
        {activeTab === 'discover' ? (
          users.length === 0 && !loading ? (
            <div className="col-12">
              <div className="text-center py-5">
                <h4>No users found</h4>
                <p>Try adjusting your filters or check back later!</p>
              </div>
            </div>
          ) : (
            users.map(userItem => (
              <UserCard key={userItem._id} user={userItem} currentUser={user} />
            ))
          )
        ) : (
          matches.length === 0 && !loading ? (
            <div className="col-12">
              <div className="text-center py-5">
                <h4>No matches found</h4>
                <p>Update your skills and wanted skills in your profile to find better matches!</p>
                <Link to="/profile" className="btn btn-primary">
                  Update Profile
                </Link>
              </div>
            </div>
          ) : (
            matches.map(match => (
              <MatchCard key={match._id} match={match} currentUser={user} />
            ))
          )
        )}
      </div>
    </div>
  );
};

const UserCard = ({ user, currentUser }) => {
  return (
    <div className="col-md-6 col-lg-4 mb-4">
      <div className="card h-100">
        <div className="card-body">
          <h5 className="card-title">{user.name}</h5>
          
          {user.location && (
            <p className="card-text">
              <i className="bi bi-geo-alt"></i> {user.location}
            </p>
          )}
          
          {user.bio && (
            <p className="card-text">{user.bio}</p>
          )}
          
          {user.skills && user.skills.length > 0 && (
            <div className="mb-2">
              <strong>Skills:</strong>
              <div className="d-flex flex-wrap gap-1 mt-1">
                {user.skills.map(skill => (
                  <span key={skill} className="badge bg-primary">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {user.wantedSkills && user.wantedSkills.length > 0 && (
            <div className="mb-3">
              <strong>Wants to learn:</strong>
              <div className="d-flex flex-wrap gap-1 mt-1">
                {user.wantedSkills.map(skill => (
                  <span key={skill} className="badge bg-secondary">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <Link 
            to={`/schedule-session/${user._id}`} 
            className="btn btn-primary"
          >
            Schedule Session
          </Link>
        </div>
      </div>
    </div>
  );
};

const MatchCard = ({ match, currentUser }) => {
  const getMatchTypeColor = (type) => {
    switch (type) {
      case 'mutual': return 'success';
      case 'teacher': return 'info';
      case 'student': return 'warning';
      default: return 'secondary';
    }
  };

  const getMatchTypeText = (type) => {
    switch (type) {
      case 'mutual': return 'Mutual Exchange';
      case 'teacher': return 'Can Teach You';
      case 'student': return 'You Can Teach';
      default: return 'Match';
    }
  };

  return (
    <div className="col-md-6 col-lg-4 mb-4">
      <div className="card h-100">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <h5 className="card-title">{match.name}</h5>
            <span className={`badge bg-${getMatchTypeColor(match.matchType)}`}>
              {getMatchTypeText(match.matchType)}
            </span>
          </div>
          
          <div className="mb-2">
            <strong>Match Score: </strong>
            <span className="badge bg-primary">{match.matchScore}</span>
          </div>
          
          {match.location && (
            <p className="card-text">
              <i className="bi bi-geo-alt"></i> {match.location}
            </p>
          )}
          
          {match.canTeachMe && match.canTeachMe.length > 0 && (
            <div className="mb-2">
              <strong>Can teach you:</strong>
              <div className="d-flex flex-wrap gap-1 mt-1">
                {match.canTeachMe.map(skill => (
                  <span key={skill} className="badge bg-success">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {match.canLearnFromMe && match.canLearnFromMe.length > 0 && (
            <div className="mb-3">
              <strong>You can teach:</strong>
              <div className="d-flex flex-wrap gap-1 mt-1">
                {match.canLearnFromMe.map(skill => (
                  <span key={skill} className="badge bg-info">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          <Link 
            to={`/schedule-session/${match._id}`} 
            className="btn btn-primary"
          >
            Schedule Session
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UserDiscovery;