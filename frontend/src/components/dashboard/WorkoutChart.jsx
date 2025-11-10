import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../../contexts/AuthContext';

const WorkoutChart = () => {
  const { user } = useAuth();
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewType, setViewType] = useState('week'); //week or month
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth()); // 0-11

  useEffect(() => {
    if (user) {
      fetchWorkoutData();
    }
  }, [user, viewType, selectedMonth, fetchWorkoutData]);

  const fetchWorkoutData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/workouts/user/${user._id}`);
      if (response.ok) {
        const workouts = await response.json();
        
        let filteredWorkouts;
        const groupedData = {};
        
        if (viewType === 'week') {
          const lastWeek = new Date();
          lastWeek.setDate(lastWeek.getDate() - 7);
          
          filteredWorkouts = workouts.filter(workout => 
            new Date(workout.date) >= lastWeek
          );
          for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dateStr = date.toISOString().split('T')[0];
            const displayDate = date.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            });
            groupedData[dateStr] = {
              date: displayDate,
              calories: 0
            };
          }
        } else {
          //get for month
          const currentYear = new Date().getFullYear();
          filteredWorkouts = workouts.filter(workout => {
            const workoutDate = new Date(workout.date);
            return workoutDate.getMonth() === selectedMonth && 
                   workoutDate.getFullYear() === currentYear;
          });

          const daysInMonth = new Date(currentYear, selectedMonth + 1, 0).getDate();
          for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentYear, selectedMonth, day);
            const dateStr = date.toISOString().split('T')[0];
            const displayDate = date.toLocaleDateString('en-US', { 
              month: 'short', 
              day: 'numeric' 
            });
            groupedData[dateStr] = {
              date: displayDate,
              calories: 0
            };
          }
        }

        filteredWorkouts.forEach(workout => {
          const workoutDate = new Date(workout.date).toISOString().split('T')[0];
          
          if (groupedData[workoutDate]) {
            groupedData[workoutDate].calories += workout.caloriesBurned || 0;
          }
        });

        //reformat for recharts
        const chartData = Object.values(groupedData);
        setChartData(chartData);
      }
    } catch (error) {
      console.error('Error fetching workout data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (monthIndex) => {
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];
    return months[monthIndex];
  };

  if (loading) {
    return (
      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Workout History</h5>
          <div className="text-center py-4">
            <div className="spinner-border" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!chartData.length || chartData.every(day => day.calories === 0)) {
    return (
      <div className="card">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="card-title mb-0">Workout History</h5>
            <div className="d-flex gap-2">
              <select 
                className="form-select form-select-sm" 
                value={viewType} 
                onChange={(e) => setViewType(e.target.value)}
                style={{ width: 'auto' }}
              >
                <option value="week">Last 7 Days</option>
                <option value="month">Monthly View</option>
              </select>
              
              {viewType === 'month' && (
                <select 
                  className="form-select form-select-sm" 
                  value={selectedMonth} 
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  style={{ width: 'auto' }}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i} value={i}>{getMonthName(i)}</option>
                  ))}
                </select>
              )}
            </div>
          </div>
          <div className="text-center py-4">
            <p className="text-muted">
              No workouts logged {viewType === 'week' ? 'in the last 7 days' : 
              `in ${getMonthName(selectedMonth)} ${new Date().getFullYear()}`}.
            </p>
            <p className="text-muted">Start logging workouts to see your progress!</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-body">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h5 className="card-title mb-0">
            {viewType === 'week' ? 'Last 7 Days' : `${getMonthName(selectedMonth)} ${new Date().getFullYear()}`} Workout History
          </h5>
          <div className="d-flex gap-2">
            <select 
              className="form-select form-select-sm" 
              value={viewType} 
              onChange={(e) => setViewType(e.target.value)}
              style={{ width: 'auto' }}
            >
              <option value="week">Last 7 Days</option>
              <option value="month">Monthly View</option>
            </select>
            
            {viewType === 'month' && (
              <select 
                className="form-select form-select-sm" 
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                style={{ width: 'auto' }}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i}>{getMonthName(i)}</option>
                ))}
              </select>
            )}
          </div>
        </div>
        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                label={{ value: 'Calories Burned', angle: -90, position: 'insideLeft' }}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value, name) => [value, 'Calories Burned']}
                labelFormatter={(label) => `Date: ${label}`}
              />
              <Line 
                type="monotone" 
                dataKey="calories" 
                stroke="#9f9f92" 
                strokeWidth={3}
                dot={{ fill: '#9f9f92', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-3">
          <small className="text-muted">
            Average calories burned per day {viewType === 'week' ? 'this week' : 
            `in ${getMonthName(selectedMonth)} ${new Date().getFullYear()}`}: {' '}
            <strong>
              {chartData.length > 0 ? Math.round(chartData.reduce((sum, day) => sum + day.calories, 0) / chartData.length) : 0} calories
            </strong>
          </small>
        </div>
      </div>
    </div>
  );
};

export default WorkoutChart;