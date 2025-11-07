import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="text-center">
        <h2>Welcome to FitSwap</h2>
        <p>Please <Link to="/login">login</Link> or <Link to="/register">register</Link> to get started.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="row">
        <div className="col-12">
          <h1>Welcome back, {user?.name}!</h1>
          <p className="lead">Your fitness journey starts here.</p>
        </div>
      </div>
      
      <div className="row mt-4">
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Your Profile</h5>
              <p className="card-text">
                Update your skills, goals, and personal information.
              </p>
              <Link to="/profile" className="btn btn-primary">
                View Profile
              </Link>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Log Workout</h5>
              <p className="card-text">
                Track your progress by logging your workouts.
              </p>
              <Link to="/workouts" className="btn btn-success">
                Log Workout
              </Link>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Find Partners</h5>
              <p className="card-text">
                Discover users and find matches based on skills.
              </p>
              <Link to="/discover" className="btn btn-info">
                Find Partners
              </Link>
            </div>
          </div>
        </div>
        
        <div className="col-md-3">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">My Sessions</h5>
              <p className="card-text">
                View and manage your training sessions.
              </p>
              <Link to="/sessions" className="btn btn-warning">
                View Sessions
              </Link>
            </div>
          </div>
        </div>
      </div>
      
      {user?.skills && user.skills.length > 0 && (
        <div className="row mt-4">
          <div className="col-12">
            <h3>Your Skills</h3>
            <div className="d-flex flex-wrap gap-2">
              {user.skills.map(skill => (
                <span key={skill} className="badge bg-primary">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {user?.wantedSkills && user.wantedSkills.length > 0 && (
        <div className="row mt-3">
          <div className="col-12">
            <h3>Skills You Want to Learn</h3>
            <div className="d-flex flex-wrap gap-2">
              {user.wantedSkills.map(skill => (
                <span key={skill} className="badge bg-secondary">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;