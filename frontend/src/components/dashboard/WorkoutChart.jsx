import React, { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "../../contexts/AuthContext";

const WorkoutChart = ({ period }) => {
  const { user } = useAuth();
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const viewType = period; // prop from Dashboard

  const getMonthName = (monthIndex) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return months[monthIndex];
  };

  useEffect(() => {
    const fetchWorkoutData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/workouts/user/${user._id}`);
        if (response.ok) {
          const workouts = await response.json();

          let filteredWorkouts;
          const groupedData = {};
          const currentYear = new Date().getFullYear();
          const currentMonth = new Date().getMonth();

          if (viewType === "day") {
            // Show last 7 days
            const lastWeek = new Date();
            lastWeek.setDate(lastWeek.getDate() - 7);

            filteredWorkouts = workouts.filter(
              (workout) => new Date(workout.date) >= lastWeek
            );
            for (let i = 6; i >= 0; i--) {
              const date = new Date();
              date.setDate(date.getDate() - i);
              const dateStr = date.toISOString().split("T")[0];
              const displayDate = date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });
              groupedData[dateStr] = {
                date: displayDate,
                calories: 0,
              };
            }

            filteredWorkouts.forEach((workout) => {
              const workoutDate = new Date(workout.date)
                .toISOString()
                .split("T")[0];

              if (groupedData[workoutDate]) {
                groupedData[workoutDate].calories +=
                  workout.caloriesBurned || 0;
              }
            });
          } else if (viewType === "month") {
            // Show current month's daily data
            filteredWorkouts = workouts.filter((workout) => {
              const workoutDate = new Date(workout.date);
              return (
                workoutDate.getMonth() === currentMonth &&
                workoutDate.getFullYear() === currentYear
              );
            });

            const daysInMonth = new Date(
              currentYear,
              currentMonth + 1,
              0
            ).getDate();
            for (let day = 1; day <= daysInMonth; day++) {
              const date = new Date(currentYear, currentMonth, day);
              const dateStr = date.toISOString().split("T")[0];
              const displayDate = date.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              });
              groupedData[dateStr] = {
                date: displayDate,
                calories: 0,
              };
            }

            filteredWorkouts.forEach((workout) => {
              const workoutDate = new Date(workout.date)
                .toISOString()
                .split("T")[0];

              if (groupedData[workoutDate]) {
                groupedData[workoutDate].calories +=
                  workout.caloriesBurned || 0;
              }
            });
          } else if (viewType === "year") {
            const monthlyData = {};
            const monthCounts = {};

            for (let month = 0; month < 12; month++) {
              const monthKey = getMonthName(month);
              monthlyData[monthKey] = 0;
              monthCounts[monthKey] = 0;
            }

            filteredWorkouts = workouts.filter((workout) => {
              const workoutDate = new Date(workout.date);
              return workoutDate.getFullYear() === currentYear;
            });

            filteredWorkouts.forEach((workout) => {
              const workoutDate = new Date(workout.date);
              const monthKey = getMonthName(workoutDate.getMonth());
              monthlyData[monthKey] += workout.caloriesBurned || 0;
              monthCounts[monthKey]++;
            });

            // Calculate average calories per day for each month
            Object.keys(monthlyData).forEach((monthKey, index) => {
              const daysInMonth = new Date(currentYear, index + 1, 0).getDate();
              groupedData[monthKey] = {
                date: monthKey.substring(0, 3), // Short month name
                calories: Math.round(monthlyData[monthKey] / daysInMonth),
              };
            });
          }

          //reformat for recharts
          const chartData = Object.values(groupedData);
          // console.log('WorkoutChart - chartData:', chartData);
          // console.log('WorkoutChart - viewType:', viewType);
          setChartData(chartData);
        }
      } catch (error) {
        console.error("Error fetching workout data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchWorkoutData();
    }
  }, [user, viewType]);

  if (loading) {
    return (
      <div className="chart-graph-container">
        <div
          style={{
            width: "100%",
            minHeight: 300,
            background: "white",
            padding: "1rem",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!chartData.length || chartData.every((day) => day.calories === 0)) {
    return (
      <div className="chart-graph-container">
        <div
          style={{
            width: "100%",
            minHeight: 300,
            background: "white",
            padding: "1rem",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}
        >
          <p className="text-muted mb-2">
            No workout data available for this period.
          </p>
          <p className="text-muted mb-0">
            Start logging workouts to see your progress!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-graph-container">
      <div
        style={{
          width: "100%",
          background: "white",
          padding: "1rem",
          borderRadius: "8px",
        }}
      >
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip
              formatter={(value) => [value, "Calories Burned"]}
              labelFormatter={(label) => `Date: ${label}`}
            />
            <Line
              type="monotone"
              dataKey="calories"
              stroke="#eb4c42"
              strokeWidth={3}
              dot={{ fill: "#eb4c42", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default WorkoutChart;
