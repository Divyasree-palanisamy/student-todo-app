// StatsPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Stats from '../components/Stats';

export default function StatsPage({ tasks, missed }) {
  const navigate = useNavigate();
  const [view, setView] = useState('daily'); // default is 'daily'

  const sendNotification = async (task) => {
    const phone = localStorage.getItem("phone");
    if (!phone) return;

    const response = await fetch('http://localhost:5000/sendNotification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        phone,
        taskTitle: task.title,
        dueDate: task.dueDate,
      }),
    });

    const data = await response.text();
    console.log(data);
  };

  return (
    <div className="app-container">
      <div className="content">
        <h1 className="stats-title">
          📊 Task Statistics
        </h1>
        <p className="stats-quote">
          "Success is the sum of small efforts, repeated day in and day out." — Robert Collier
        </p>

        {/* View Buttons */}
        <div className="stats-view-buttons">
          {['daily', 'weekly', 'monthly'].map((type) => (
            <button
              key={type}
              onClick={() => setView(type)}
              className={`stats-view-btn${view === type ? ' active' : ''}`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {/* Stats Component and Overview */}
        <div className="stats-chart-container">
          <Stats tasks={tasks} missed={missed} view={view} />
          <div className="stats-summary">
            <h2>📅 Overview</h2>
            <p>
              You have completed <span className="stats-completed">{tasks.length}</span> tasks,
              and missed <span className="stats-missed">{missed.length}</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}  