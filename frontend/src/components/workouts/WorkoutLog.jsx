import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import "../../styles/WorkoutLog.css";

const WorkoutLog = () => {
  const { user } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [thisWeekPage, setThisWeekPage] = useState(1);
  const [previousPage, setPreviousPage] = useState(1);
  const workoutsPerPage = 9;
  const previousWorkoutsPerPage = 9;
  const [expandedNotes, setExpandedNotes] = useState({});
  const [formData, setFormData] = useState({
    type: "",
    date: new Date().toISOString().split("T")[0],
    duration: "",
    caloriesBurned: "",
    exercises: [],
    distance: "",
    notes: "",
  });

  const workoutTypes = [
    "Weightlifting",
    "Cardio",
    "Running",
    "Cycling",
    "Swimming",
    "Yoga",
    "Boxing",
    "CrossFit",
    "Pilates",
    "Rock Climbing",
  ];

  const fetchWorkouts = useCallback(async () => {
    try {
      const response = await fetch(`/api/workouts/user/${user._id}`);
      if (response.ok) {
        const data = await response.json();
        setWorkouts(data);
      }
    } catch (error) {
      console.error("Error fetching workouts:", error);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchWorkouts();
    }
  }, [user, fetchWorkouts]);

  const deleteWorkout = async (workoutId) => {
    if (window.confirm("Are you sure you want to delete this workout?")) {
      try {
        const response = await fetch(`/api/workouts/${workoutId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          fetchWorkouts(); //refresh
        } else {
          console.error("Error deleting workout");
        }
      } catch (error) {
        console.error("Error deleting workout:", error);
      }
    }
  };

  const startEdit = (workout) => {
    setEditingWorkout(workout._id);
    setFormData({
      type: Array.isArray(workout.type)
        ? workout.type[0] || ""
        : workout.type || "",
      date: workout.date.split("T")[0],
      duration: workout.duration || "",
      caloriesBurned: workout.caloriesBurned || "",
      exercises: workout.exercises || [],
      distance: workout.distance || "",
      notes: workout.notes || "",
    });
    setShowForm(true);
  };

  const updateWorkout = async (workoutId, updatedData) => {
    try {
      const response = await fetch(`/api/workouts/${workoutId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        fetchWorkouts(); //refresh
        setEditingWorkout(null);
        setShowForm(false);
        //reset form
        setFormData({
          type: "",
          date: new Date().toISOString().split("T")[0],
          duration: "",
          caloriesBurned: "",
          exercises: [],
          distance: "",
          notes: "",
        });
      } else {
        console.error("Error updating workout");
      }
    } catch (error) {
      console.error("Error updating workout:", error);
    }
  };

  const cancelEdit = () => {
    setEditingWorkout(null);
    setShowForm(false);
    setFormData({
      type: "",
      date: new Date().toISOString().split("T")[0],
      duration: "",
      caloriesBurned: "",
      exercises: [],
      distance: "",
      notes: "",
    });
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

      if (editingWorkout) {
        //update workout
        await updateWorkout(editingWorkout, workoutData);
      } else {
        //create workout
        const response = await fetch("/api/workouts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(workoutData),
        });

        if (response.ok) {
          setFormData({
            type: "",
            date: new Date().toISOString().split("T")[0],
            duration: "",
            caloriesBurned: "",
            exercises: [],
            distance: "",
            notes: "",
          });
          setShowForm(false);
          fetchWorkouts(); //refresh the list
        }
      }
    } catch (error) {
      console.error("Error logging workout:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleNotes = (workoutId) => {
    setExpandedNotes((prev) => ({
      ...prev,
      [workoutId]: !prev[workoutId],
    }));
  };

  const renderNotes = (workout) => {
    if (!workout.notes) return null;

    const maxLength = 50;
    const isLong = workout.notes.length > maxLength;
    const isExpanded = expandedNotes[workout._id];

    return (
      <div className="mb-2 workout-notes">
        <strong>Notes:</strong>{" "}
        <div
          className={
            isLong && isExpanded
              ? "workout-notes-full"
              : isLong
                ? "workout-notes-preview"
                : ""
          }
        >
          {workout.notes}
        </div>
        {isLong && (
          <span
            className="workout-notes-toggle"
            onClick={() => toggleNotes(workout._id)}
          >
            {isExpanded ? "Show less" : "Show more"}
          </span>
        )}
      </div>
    );
  };

  if (!user) {
    return <div>Please log in to view your workouts.</div>;
  }

  return (
    <div className="workout-log-container">
      {showForm && (
        <>
          <div
            className="workout-form-overlay"
            onClick={() => {
              setShowForm(false);
              setEditingWorkout(null);
            }}
          ></div>
          <div className="workout-form-modal">
            <div className="workout-form-header">
              <h5 className="workout-form-title">
                {editingWorkout ? "Edit Workout" : "Log New Workout"}
              </h5>
              <button
                type="button"
                className="workout-form-close"
                onClick={() => {
                  setShowForm(false);
                  setEditingWorkout(null);
                }}
                aria-label="Close form"
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label htmlFor="type" className="form-label">
                    Workout Type
                  </label>
                  <select
                    className="form-select"
                    id="type"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select workout type</option>
                    {workoutTypes.map((type) => (
                      <option key={type} value={type.toLowerCase()}>
                        {type}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-md-6 mb-3">
                  <label htmlFor="date" className="form-label">
                    Date
                  </label>
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
                  <label htmlFor="duration" className="form-label">
                    Duration (minutes)
                  </label>
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
                  <label htmlFor="caloriesBurned" className="form-label">
                    Calories Burned
                  </label>
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
                  <label htmlFor="distance" className="form-label">
                    Distance (miles)
                  </label>
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
                <label htmlFor="notes" className="form-label">
                  Notes
                </label>
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

              <div className="d-flex gap-2">
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={loading}
                >
                  {loading
                    ? editingWorkout
                      ? "Updating..."
                      : "Logging..."
                    : editingWorkout
                      ? "Update Workout"
                      : "Log Workout"}
                </button>

                {editingWorkout && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={cancelEdit}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        </>
      )}

      {workouts.length === 0 ? (
        <div className="text-center py-5">
          <h4>No workouts logged yet</h4>
          <p>
            Start tracking your fitness journey by logging your first workout!
          </p>
          <button
            className="btn log-workout-btn mt-3"
            onClick={() => setShowForm(true)}
          >
            Log New Workout
          </button>
        </div>
      ) : (
        <>
          {(() => {
            const now = new Date();
            const startOfWeek = new Date(now);
            startOfWeek.setDate(now.getDate() - now.getDay());
            startOfWeek.setHours(0, 0, 0, 0);

            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);

            const formatDate = (date) => {
              return date.toLocaleDateString("en-US", {
                month: "long",
                day: "2-digit",
                year: "numeric",
              });
            };

            const thisWeek = workouts.filter((workout) => {
              const workoutDate = new Date(workout.date);
              return workoutDate >= startOfWeek;
            });

            const previous = workouts.filter((workout) => {
              const workoutDate = new Date(workout.date);
              return workoutDate < startOfWeek;
            });

            const thisWeekStart = (thisWeekPage - 1) * workoutsPerPage;
            const thisWeekEnd = thisWeekStart + workoutsPerPage;
            const paginatedThisWeek = thisWeek.slice(
              thisWeekStart,
              thisWeekEnd
            );
            const thisWeekTotalPages = Math.ceil(
              thisWeek.length / workoutsPerPage
            );

            const previousStart = (previousPage - 1) * previousWorkoutsPerPage;
            const previousEnd = previousStart + previousWorkoutsPerPage;
            const paginatedPrevious = previous.slice(
              previousStart,
              previousEnd
            );
            const previousTotalPages = Math.ceil(
              previous.length / previousWorkoutsPerPage
            );

            return (
              <div>
                <div>
                  {thisWeek.length > 0 && (
                    <div className="mb-5">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h4 className="workout-section-title mb-0">
                          This Week
                        </h4>
                        <button
                          className="btn log-workout-btn"
                          onClick={() => {
                            if (editingWorkout) {
                              cancelEdit();
                            } else {
                              setShowForm(!showForm);
                            }
                          }}
                        >
                          {showForm ? "Cancel" : "Log New Workout"}
                        </button>
                      </div>
                      <hr className="workout-divider mb-4" />
                      <div className="row">
                        {paginatedThisWeek.map((workout) => (
                          <div
                            key={workout._id}
                            className="col-md-6 col-lg-4 mb-3"
                          >
                            <div
                              className={`card workout-card ${expandedNotes[workout._id] ? "expanded" : ""}`}
                            >
                              <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <h5 className="card-title text-capitalize">
                                    {workout.type}
                                  </h5>
                                  <div className="d-flex align-items-center gap-2">
                                    <small className="workout-date">
                                      {new Date(
                                        workout.date
                                      ).toLocaleDateString()}
                                    </small>
                                    <div className="dropdown">
                                      <button
                                        className="btn btn-link text-dark p-0"
                                        type="button"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                        aria-label="Workout options menu"
                                        style={{
                                          fontSize: "1.2rem",
                                          lineHeight: 1,
                                        }}
                                      >
                                        <i className="bi bi-three-dots"></i>
                                      </button>
                                      <ul className="dropdown-menu dropdown-menu-end">
                                        <li>
                                          <button
                                            className="dropdown-item"
                                            onClick={() => startEdit(workout)}
                                          >
                                            <i className="bi bi-pencil me-2"></i>
                                            Edit
                                          </button>
                                        </li>
                                        <li>
                                          <button
                                            className="dropdown-item text-danger"
                                            onClick={() =>
                                              deleteWorkout(workout._id)
                                            }
                                          >
                                            <i className="bi bi-trash me-2"></i>
                                            Delete
                                          </button>
                                        </li>
                                      </ul>
                                    </div>
                                  </div>
                                </div>

                                <div className="workout-stats">
                                  <div className="workout-stat-item">
                                    <div className="workout-stat-icon">
                                      <i className="bi bi-stopwatch"></i>
                                    </div>
                                    <div className="workout-stat-content">
                                      <div className="workout-stat-label">
                                        Duration
                                      </div>
                                      <div className="workout-stat-value">
                                        {workout.duration}{" "}
                                        <span className="workout-stat-unit">
                                          min
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  {workout.caloriesBurned > 0 && (
                                    <div className="workout-stat-item">
                                      <div className="workout-stat-icon">
                                        <i className="bi bi-fire"></i>
                                      </div>
                                      <div className="workout-stat-content">
                                        <div className="workout-stat-label">
                                          Calories
                                        </div>
                                        <div className="workout-stat-value">
                                          {workout.caloriesBurned}{" "}
                                          <span className="workout-stat-unit">
                                            cal
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {workout.distance && (
                                  <div className="mb-2">
                                    <strong>Distance:</strong>{" "}
                                    {workout.distance} miles
                                  </div>
                                )}

                                {renderNotes(workout)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {thisWeekTotalPages > 1 && (
                        <div className="d-flex justify-content-center align-items-center gap-2 mt-3">
                          <button
                            className="chart-filter-btn"
                            onClick={() => setThisWeekPage(1)}
                            disabled={thisWeekPage === 1}
                          >
                            First
                          </button>
                          <button
                            className="chart-filter-btn"
                            onClick={() =>
                              setThisWeekPage((prev) => Math.max(1, prev - 1))
                            }
                            disabled={thisWeekPage === 1}
                            aria-label="Previous page"
                          >
                            <i className="bi bi-chevron-left"></i>
                          </button>
                          {(() => {
                            const maxButtons = 5;
                            let startPage = Math.max(
                              1,
                              thisWeekPage - Math.floor(maxButtons / 2)
                            );
                            let endPage = Math.min(
                              thisWeekTotalPages,
                              startPage + maxButtons - 1
                            );
                            if (endPage - startPage + 1 < maxButtons) {
                              startPage = Math.max(1, endPage - maxButtons + 1);
                            }
                            return Array.from(
                              { length: endPage - startPage + 1 },
                              (_, i) => startPage + i
                            ).map((page) => (
                              <button
                                key={page}
                                className={`chart-filter-btn ${page === thisWeekPage ? "active" : ""}`}
                                onClick={() => setThisWeekPage(page)}
                              >
                                {page}
                              </button>
                            ));
                          })()}
                          <button
                            className="chart-filter-btn"
                            onClick={() =>
                              setThisWeekPage((prev) =>
                                Math.min(thisWeekTotalPages, prev + 1)
                              )
                            }
                            disabled={thisWeekPage === thisWeekTotalPages}
                            aria-label="Next page"
                          >
                            <i className="bi bi-chevron-right"></i>
                          </button>
                          <button
                            className="chart-filter-btn"
                            onClick={() => setThisWeekPage(thisWeekTotalPages)}
                            disabled={thisWeekPage === thisWeekTotalPages}
                          >
                            Last
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {previous.length > 0 && (
                    <div className="mb-5">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h4 className="workout-section-title mb-0">
                          Previous Workouts
                        </h4>
                        {thisWeek.length === 0 && (
                          <button
                            className="btn log-workout-btn"
                            onClick={() => {
                              if (editingWorkout) {
                                cancelEdit();
                              } else {
                                setShowForm(!showForm);
                              }
                            }}
                          >
                            {showForm ? "Cancel" : "Log New Workout"}
                          </button>
                        )}
                      </div>
                      <hr className="workout-divider mb-4" />
                      <div className="row">
                        {paginatedPrevious.map((workout) => (
                          <div
                            key={workout._id}
                            className="col-md-6 col-lg-4 mb-3"
                          >
                            <div
                              className={`card workout-card ${expandedNotes[workout._id] ? "expanded" : ""}`}
                            >
                              <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <h5 className="card-title text-capitalize">
                                    {workout.type}
                                  </h5>
                                  <div className="d-flex align-items-center gap-2">
                                    <small className="workout-date">
                                      {new Date(
                                        workout.date
                                      ).toLocaleDateString()}
                                    </small>
                                    <div className="dropdown">
                                      <button
                                        className="btn btn-link text-dark p-0"
                                        type="button"
                                        data-bs-toggle="dropdown"
                                        aria-expanded="false"
                                        aria-label="Workout options menu"
                                        style={{
                                          fontSize: "1.2rem",
                                          lineHeight: 1,
                                        }}
                                      >
                                        <i className="bi bi-three-dots"></i>
                                      </button>
                                      <ul className="dropdown-menu dropdown-menu-end">
                                        <li>
                                          <button
                                            className="dropdown-item"
                                            onClick={() => startEdit(workout)}
                                          >
                                            <i className="bi bi-pencil me-2"></i>
                                            Edit
                                          </button>
                                        </li>
                                        <li>
                                          <button
                                            className="dropdown-item text-danger"
                                            onClick={() =>
                                              deleteWorkout(workout._id)
                                            }
                                          >
                                            <i className="bi bi-trash me-2"></i>
                                            Delete
                                          </button>
                                        </li>
                                      </ul>
                                    </div>
                                  </div>
                                </div>

                                <div className="workout-stats">
                                  <div className="workout-stat-item">
                                    <div className="workout-stat-icon">
                                      <i className="bi bi-stopwatch"></i>
                                    </div>
                                    <div className="workout-stat-content">
                                      <div className="workout-stat-label">
                                        Duration
                                      </div>
                                      <div className="workout-stat-value">
                                        {workout.duration}{" "}
                                        <span className="workout-stat-unit">
                                          min
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                  {workout.caloriesBurned > 0 && (
                                    <div className="workout-stat-item">
                                      <div className="workout-stat-icon">
                                        <i className="bi bi-fire"></i>
                                      </div>
                                      <div className="workout-stat-content">
                                        <div className="workout-stat-label">
                                          Calories
                                        </div>
                                        <div className="workout-stat-value">
                                          {workout.caloriesBurned}{" "}
                                          <span className="workout-stat-unit">
                                            cal
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {workout.distance && (
                                  <div className="mb-2">
                                    <strong>Distance:</strong>{" "}
                                    {workout.distance} miles
                                  </div>
                                )}

                                {renderNotes(workout)}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {previousTotalPages > 1 && (
                        <div className="d-flex justify-content-center align-items-center gap-2 mt-3">
                          <button
                            className="chart-filter-btn"
                            onClick={() => setPreviousPage(1)}
                            disabled={previousPage === 1}
                          >
                            First
                          </button>
                          <button
                            className="chart-filter-btn"
                            onClick={() =>
                              setPreviousPage((prev) => Math.max(1, prev - 1))
                            }
                            disabled={previousPage === 1}
                            aria-label="Previous page"
                          >
                            <i className="bi bi-chevron-left"></i>
                          </button>
                          {(() => {
                            const maxButtons = 5;
                            let startPage = Math.max(
                              1,
                              previousPage - Math.floor(maxButtons / 2)
                            );
                            let endPage = Math.min(
                              previousTotalPages,
                              startPage + maxButtons - 1
                            );
                            if (endPage - startPage + 1 < maxButtons) {
                              startPage = Math.max(1, endPage - maxButtons + 1);
                            }
                            return Array.from(
                              { length: endPage - startPage + 1 },
                              (_, i) => startPage + i
                            ).map((page) => (
                              <button
                                key={page}
                                className={`chart-filter-btn ${page === previousPage ? "active" : ""}`}
                                onClick={() => setPreviousPage(page)}
                              >
                                {page}
                              </button>
                            ));
                          })()}
                          <button
                            className="chart-filter-btn"
                            onClick={() =>
                              setPreviousPage((prev) =>
                                Math.min(previousTotalPages, prev + 1)
                              )
                            }
                            disabled={previousPage === previousTotalPages}
                            aria-label="Next page"
                          >
                            <i className="bi bi-chevron-right"></i>
                          </button>
                          <button
                            className="chart-filter-btn"
                            onClick={() => setPreviousPage(previousTotalPages)}
                            disabled={previousPage === previousTotalPages}
                          >
                            Last
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </>
      )}
    </div>
  );
};

export default WorkoutLog;
