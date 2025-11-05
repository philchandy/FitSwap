import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const WorkoutLog = () => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: '',
    date: new Date().toISOString().split('T')[0],
    duration: '',
    caloriesBurned: '',
    exercises: [],
    distance: '',
    notes: '',
  });

  const workoutTypes = [
    'Weightlifting', 'Cardio', 'Running', 'Cycling', 'Swimming', 
    'Yoga', 'Boxing', 'CrossFit', 'Pilates', 'Rock Climbing'
  ];

  useEffect(() => {
    if (user) {
      fetchWorkouts();
    }
  }, [user]);

  const fetchWorkouts = async () => {
    try {
      const response = await fetch(`/api/workouts/user/${user._id}`);
      if (response.ok) {
        const data = await response.json();
        setWorkouts(data);
      }
    } catch (error) {
      console.error('Error fetching workouts:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const workoutData = {
        ...formData,
        userId: user._id,
        duration: parseInt(formData.duration),
        caloriesBurned: parseInt(formData.caloriesBurned) || 0,
        distance: formData.distance ? parseFloat(formData.distance) : null,
      };

      const response = await fetch('/api/workouts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(workoutData),
      });

      if (response.ok) {
        setFormData({
          type: '',
          date: new Date().toISOString().split('T')[0],
          duration: '',
          caloriesBurned: '',
          exercises: [],
          distance: '',
          notes: '',
        });
        setShowForm(false);
        fetchWorkouts(); // Refresh the list
      }
    } catch (error) {
      console.error('Error logging workout:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div>Please log in to view your workouts.</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Workouts</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : 'Log New Workout'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title">Log New Workout</h5>
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="type" className="form-label">Workout Type</label>
                  <select
                    className="form-select"
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select workout type</option>
                    {workoutTypes.map(type => (
                      <option key={type} value={type.toLowerCase()}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6 mb-3">
                  <label htmlFor="date" className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-control"
                    id="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-4 mb-3">
                  <label htmlFor="duration" className="form-label">Duration (minutes)</label>
                  <input
                    type="number"
                    className="form-control"
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="col-md-4 mb-3">
                  <label htmlFor="caloriesBurned" className="form-label">Calories Burned</label>
                  <input
                    type="number"
                    className="form-control"
                    id="caloriesBurned"
                    name="caloriesBurned"
                    value={formData.caloriesBurned}
                    onChange={handleChange}
                  />
                </div>

                <div className="col-md-4 mb-3">
                  <label htmlFor="distance" className="form-label">Distance (miles)</label>
                  <input
                    type="number"
                    step="0.1"
                    className="form-control"
                    id="distance"
                    name="distance"
                    value={formData.distance}
                    onChange={handleChange}
                    placeholder="For cardio workouts"
                  />
                </div>
              </div>

              <div className="mb-3">
                <label htmlFor="notes" className="form-label">Notes</label>
                <textarea
                  className="form-control"
                  id="notes"
                  name="notes"
                  rows="3"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="How did it go? Any observations?"
                />
              </div>

              <button
                type="submit"
                className="btn btn-success"
                disabled={loading}
              >
                {loading ? 'Logging...' : 'Log Workout'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="row">
        {workouts.length === 0 ? (
          <div className="col-12">
            <div className="text-center py-5">
              <h4>No workouts logged yet</h4>
              <p>Start tracking your fitness journey by logging your first workout!</p>
            </div>
          </div>
        ) : (
          workouts.map(workout => (
            <div key={workout._id} className="col-md-6 col-lg-4 mb-3">
              <div className="card">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="card-title text-capitalize">{workout.type}</h5>
                    <small className="text-muted">
                      {new Date(workout.date).toLocaleDateString()}
                    </small>
                  </div>
                  
                  <div className="mb-2">
                    <strong>Duration:</strong> {workout.duration} minutes
                  </div>
                  
                  {workout.caloriesBurned > 0 && (
                    <div className="mb-2">
                      <strong>Calories:</strong> {workout.caloriesBurned}
                    </div>
                  )}
                  
                  {workout.distance && (
                    <div className="mb-2">
                      <strong>Distance:</strong> {workout.distance} miles
                    </div>
                  )}
                  
                  {workout.notes && (
                    <div className="mb-2">
                      <strong>Notes:</strong> {workout.notes}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default WorkoutLog;