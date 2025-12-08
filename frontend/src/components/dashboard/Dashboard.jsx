import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { Link } from "react-router-dom";
import WorkoutChart from "./WorkoutChart";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import "../../styles/dashboard.css";

const Dashboard = () => {
  const { user, isAuthenticated } = useAuth();
  const [dailyStats, setDailyStats] = useState({
    calories: 0,
    exerciseMinutes: 0,
  });
  const [sessionStats, setSessionStats] = useState({
    completedSessions: 0,
    totalSessions: 0,
  });
  const [chartPeriod, setChartPeriod] = useState("day");
  const [weeklyWorkouts, setWeeklyWorkouts] = useState([]);
  const [skillsExpanded, setSkillsExpanded] = useState(false);
  const [hasWorkouts, setHasWorkouts] = useState(true);
  const [pieChartPeriod, setPieChartPeriod] = useState("week");

  const fetchDailyStats = useCallback(() => {
    if (!user || !user._id) {
      console.log("No user available yet");
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    fetch(`/api/workouts/user/${user._id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch workouts");
        }
        return res.json();
      })
      .then((data) => {
        const todaysWorkouts = data.filter((w) => {
          const workoutDate = new Date(w.date).toISOString().split("T")[0];
          return workoutDate === today;
        });

        const totalCalories = todaysWorkouts.reduce(
          (sum, w) => sum + (w.caloriesBurned || 0),
          0
        );
        const totalMinutes = todaysWorkouts.reduce(
          (sum, w) => sum + (w.duration || 0),
          0
        );

        setDailyStats({
          calories: totalCalories,
          exerciseMinutes: totalMinutes,
        });
      })
      .catch((err) => {
        console.error("Error fetching daily stats:", err);
        setDailyStats({
          calories: 0,
          exerciseMinutes: 0,
        });
      });
  }, [user]);

  const fetchSessionStats = useCallback(() => {
    if (!user || !user._id) {
      console.log("No user available yet");
      return;
    }

    fetch(`/api/sessions/user/${user._id}`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to fetch sessions");
        }
        return res.json();
      })
      .then((data) => {
        const completedSessions = data.filter((session) => {
          return session.status === "completed";
        }).length;

        setSessionStats({
          completedSessions,
          totalSessions: data.length,
        });
      })
      .catch((err) => {
        console.error("Error fetching session stats:", err);
        // Set default values if fetch fails
        setSessionStats({
          completedSessions: 0,
          totalSessions: 0,
        });
      });
  }, [user]);

  const checkWorkoutsAndSetPeriod = useCallback(() => {
    if (!user || !user._id) {
      return;
    }

    fetch(`/api/workouts/user/${user._id}`)
      .then((res) => res.json())
      .then((workouts) => {
        if (workouts.length === 0) {
          setHasWorkouts(false);
          return;
        }

        const now = new Date();
        const today = now.toISOString().split("T")[0];

        // Check for workouts today
        const todayWorkouts = workouts.filter((w) => {
          const workoutDate = new Date(w.date).toISOString().split("T")[0];
          return workoutDate === today;
        });

        if (todayWorkouts.length > 0) {
          setChartPeriod("day");
          setHasWorkouts(true);
          return;
        }

        // Check for workouts this month
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        const monthWorkouts = workouts.filter((w) => {
          const workoutDate = new Date(w.date);
          return (
            workoutDate.getMonth() === currentMonth &&
            workoutDate.getFullYear() === currentYear
          );
        });

        if (monthWorkouts.length > 0) {
          setChartPeriod("month");
          setHasWorkouts(true);
          return;
        }

        // Check for workouts this year
        const yearWorkouts = workouts.filter((w) => {
          const workoutDate = new Date(w.date);
          return workoutDate.getFullYear() === currentYear;
        });

        if (yearWorkouts.length > 0) {
          setChartPeriod("year");
          setHasWorkouts(true);
        } else {
          setHasWorkouts(false);
        }
      })
      .catch((err) => {
        console.error("Error checking workouts:", err);
        setHasWorkouts(true);
      });
  }, [user]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchDailyStats();
      fetchSessionStats();
      checkWorkoutsAndSetPeriod();
    }
  }, [
    isAuthenticated,
    user,
    fetchDailyStats,
    fetchSessionStats,
    checkWorkoutsAndSetPeriod,
  ]);

  useEffect(() => {
    if (user && user._id) {
      fetch(`/api/workouts/user/${user._id}`)
        .then((res) => res.json())
        .then((data) => {
          // Store ALL workouts so the pie chart can filter them by period
          setWeeklyWorkouts(data);
        })
        .catch((err) => console.error("Error fetching workouts:", err));
    }
  }, [user]);

  if (!isAuthenticated) {
    return (
      <div className="text-center">
        <h2>Welcome to FitSwap</h2>
        <p>
          Please <Link to="/login">login</Link> or{" "}
          <Link to="/register">register</Link> to get started.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="row mb-5">
        <div className="col-12">
          <h1>Welcome back, {user?.name}!</h1>
          <p className="lead">Your fitness journey starts here.</p>
        </div>
      </div>

      <div className="row mt-5 mb-6 justify-content-center gx-5">
        <div className="col-md-3">
          <div className="tracker-card">
            <div className="tracker-icon">
              <i className="bi bi-fire"></i>
            </div>
            <div className="tracker-content">
              <p className="tracker-label">Calories Burned Today</p>
              <p className="tracker-value">
                {dailyStats.calories.toLocaleString()}{" "}
                <span className="tracker-unit">cal</span>
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="tracker-card">
            <div className="tracker-icon">
              <i className="bi bi-stopwatch"></i>
            </div>
            <div className="tracker-content">
              <p className="tracker-label">Exercise Minutes Today</p>
              <p className="tracker-value">
                {dailyStats.exerciseMinutes}{" "}
                <span className="tracker-unit">min</span>
              </p>
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div
            className={`tracker-card skills-card ${skillsExpanded ? "expanded" : ""}`}
          >
            <div className="tracker-icon">
              <i className="bi bi-award"></i>
            </div>
            <div className="tracker-content">
              <p className="tracker-label">My Skills</p>
              <div className="skills-list">
                {user?.skills && user.skills.length > 0 ? (
                  (skillsExpanded ? user.skills : user.skills.slice(0, 2)).map(
                    (skill, index) => (
                      <span key={index} className="skill-badge">
                        {skill}
                      </span>
                    )
                  )
                ) : (
                  <span className="no-skills">No skills added</span>
                )}
              </div>
              <p className="tracker-label mt-3">Want to Learn</p>
              <div className="skills-list">
                {user?.wantedSkills && user.wantedSkills.length > 0 ? (
                  (skillsExpanded
                    ? user.wantedSkills
                    : user.wantedSkills.slice(0, 2)
                  ).map((skill, index) => (
                    <span key={index} className="skill-badge wanted">
                      {skill}
                    </span>
                  ))
                ) : (
                  <span className="no-skills">No skills added</span>
                )}
              </div>
              {((user?.skills && user.skills.length > 2) ||
                (user?.wantedSkills && user.wantedSkills.length > 2)) && (
                <span
                  className="skills-toggle"
                  onClick={() => setSkillsExpanded(!skillsExpanded)}
                >
                  {skillsExpanded ? "Show less" : "Show more"}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="col-md-3">
          <div className="tracker-card">
            <div className="tracker-icon">
              <i className="bi bi-calendar-check"></i>
            </div>
            <div className="tracker-content">
              <p className="tracker-label">Completed Sessions</p>
              <p className="tracker-value">
                {sessionStats.completedSessions}{" "}
                <span className="tracker-unit">
                  / {sessionStats.totalSessions}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="row mt-5">
        <div className="col-lg-8">
          <div className="chart-section">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="chart-section-title">Calories Burned</h2>
              <div className="chart-filters">
                <button
                  className={`chart-filter-btn ${chartPeriod === "day" ? "active" : ""}`}
                  onClick={() => setChartPeriod("day")}
                >
                  Day
                </button>
                <button
                  className={`chart-filter-btn ${chartPeriod === "month" ? "active" : ""}`}
                  onClick={() => setChartPeriod("month")}
                >
                  Month
                </button>
                <button
                  className={`chart-filter-btn ${chartPeriod === "year" ? "active" : ""}`}
                  onClick={() => setChartPeriod("year")}
                >
                  Year
                </button>
              </div>
            </div>
            <hr className="chart-divider" />
            {hasWorkouts ? (
              <WorkoutChart period={chartPeriod} />
            ) : (
              <div className="text-center py-5">
                <i
                  className="bi bi-bar-chart-line"
                  style={{ fontSize: "3rem", color: "rgba(0, 0, 0, 0.3)" }}
                ></i>
                <h2 className="mt-3" style={{ color: "rgba(0, 0, 0, 0.6)" }}>
                  No Workout Data Available
                </h2>
                <p style={{ color: "rgba(0, 0, 0, 0.5)" }}>
                  Start logging workouts to display reports
                </p>
                <Link to="/workouts" className="btn btn-primary mt-2">
                  Log Your First Workout
                </Link>
              </div>
            )}
          </div>
        </div>
        <div className="col-lg-4">
          {weeklyWorkouts.length > 0 &&
            (() => {
              const now = new Date();

              // Filter workouts based on selected period
              let filteredWorkouts = [];
              let dateRangeText = "";

              if (pieChartPeriod === "week") {
                const startOfWeek = new Date(now);
                startOfWeek.setDate(now.getDate() - now.getDay());
                startOfWeek.setHours(0, 0, 0, 0);

                const endOfWeek = new Date(startOfWeek);
                endOfWeek.setDate(startOfWeek.getDate() + 6);
                endOfWeek.setHours(23, 59, 59, 999);

                filteredWorkouts = weeklyWorkouts.filter((workout) => {
                  const workoutDate = new Date(workout.date);
                  return workoutDate >= startOfWeek && workoutDate <= endOfWeek;
                });

                dateRangeText = `${startOfWeek.toLocaleDateString("en-US", {
                  month: "short",
                  day: "2-digit",
                })} - ${endOfWeek.toLocaleDateString("en-US", {
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                })}`;
              } else if (pieChartPeriod === "month") {
                const startOfMonth = new Date(
                  now.getFullYear(),
                  now.getMonth(),
                  1
                );
                const endOfMonth = new Date(
                  now.getFullYear(),
                  now.getMonth() + 1,
                  0
                );
                endOfMonth.setHours(23, 59, 59, 999);

                filteredWorkouts = weeklyWorkouts.filter((workout) => {
                  const workoutDate = new Date(workout.date);
                  return (
                    workoutDate >= startOfMonth && workoutDate <= endOfMonth
                  );
                });

                dateRangeText = now.toLocaleDateString("en-US", {
                  month: "long",
                  year: "numeric",
                });
              } else if (pieChartPeriod === "year") {
                const startOfYear = new Date(now.getFullYear(), 0, 1);
                startOfYear.setHours(0, 0, 0, 0);
                const endOfYear = new Date(now.getFullYear(), 11, 31);
                endOfYear.setHours(23, 59, 59, 999);

                filteredWorkouts = weeklyWorkouts.filter((workout) => {
                  const workoutDate = new Date(workout.date);
                  return workoutDate >= startOfYear && workoutDate <= endOfYear;
                });

                dateRangeText = now.getFullYear().toString();
              }

              const workoutTypeData = {};
              let skippedCount = 0;
              filteredWorkouts.forEach((workout) => {
                let workoutType = workout.type;
                if (Array.isArray(workoutType)) {
                  workoutType = workoutType[0];
                }

                if (!workoutType || typeof workoutType !== "string") {
                  skippedCount++;
                  return;
                }

                const normalizedType = workoutType.toLowerCase().trim();
                const type =
                  normalizedType.charAt(0).toUpperCase() +
                  normalizedType.slice(1);
                if (!workoutTypeData[type]) {
                  workoutTypeData[type] = 0;
                }
                workoutTypeData[type] += workout.duration || 0;
              });

              console.log(
                "Workouts skipped due to invalid type:",
                skippedCount
              );
              console.log("Workout type data:", workoutTypeData);

              const pieChartData = Object.keys(workoutTypeData).map((type) => ({
                name: type,
                value: workoutTypeData[type],
              }));

              const COLORS = [
                "#eb4c42",
                "#f07870",
                "#9f9f92",
                "#6d6466",
                "#4e3d42",
                "#c9d5b5",
                "#e3dbdb",
              ];

              return (
                <div className="report-section">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className="d-flex align-items-center gap-2">
                      <h2 className="report-section-title mb-0">Report</h2>
                      <span className="report-week-period">
                        {dateRangeText}
                      </span>
                    </div>
                    <div className="chart-filters">
                      <button
                        className={`chart-filter-btn ${pieChartPeriod === "week" ? "active" : ""}`}
                        onClick={() => setPieChartPeriod("week")}
                      >
                        Week
                      </button>
                      <button
                        className={`chart-filter-btn ${pieChartPeriod === "month" ? "active" : ""}`}
                        onClick={() => setPieChartPeriod("month")}
                      >
                        Month
                      </button>
                      <button
                        className={`chart-filter-btn ${pieChartPeriod === "year" ? "active" : ""}`}
                        onClick={() => setPieChartPeriod("year")}
                      >
                        Year
                      </button>
                    </div>
                  </div>
                  <hr className="report-divider" />
                  <div className="report-chart-container">
                    {pieChartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                          <Pie
                            data={pieChartData}
                            cx="35%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {pieChartData.map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => `${value} minutes`} />
                          <Legend
                            layout="vertical"
                            align="center"
                            verticalAlign="middle"
                            wrapperStyle={{
                              right: 0,
                              left: "auto",
                              color: "black",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="text-center text-muted py-5">
                        No workouts in this period
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
        </div>
      </div>

      <div className="row mt-5">
        <div className="col-12">
          <div className="goals-section">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="goals-section-title mb-0">Your Goals</h2>
              <Link to="/profile" className="goals-edit-btn">
                Edit Goals
              </Link>
            </div>
            <hr className="goals-divider" />

            {user?.goals && user.goals.length > 0 ? (
              <ul className="goals-list">
                {user.goals.map((goal, index) => (
                  <li key={index} className="goal-item">
                    {goal}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-4">
                <i
                  className="bi bi-clipboard-x text-muted"
                  style={{ fontSize: "2rem" }}
                ></i>
                <p className="text-muted mt-2 mb-3">No goals set yet</p>
                <p className="text-muted small mb-3">
                  Set your fitness goals to stay motivated and track your
                  progress!
                </p>
                <Link to="/profile" className="btn btn-primary btn-sm">
                  <i className="bi bi-plus-circle me-1"></i>
                  Add Your First Goal
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
