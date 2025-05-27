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
    <>
      <nav className="navbar">
        <div className="navbar-left"></div>
        <div className="navbar-right">
          <button onClick={() => navigate("/")}>🏠 Home</button>
          <button onClick={() => navigate("/missed")}>⏰ Missed Tasks</button>
          <button onClick={() => navigate("/study-material")}>📚 Study Material</button>
        </div>
      </nav>
  
      {/* Add app-container and page-container here */}
      <div className="app-container">
        <div className="content">
          <h1 className="text-4xl font-bold mb-4 mt-4 drop-shadow-lg text-center">
            📊 Task Statistics
          </h1>
          <p className="text-lg text-gray-200 mb-6 max-w-2xl text-center italic">
            "Success is the sum of small efforts, repeated day in and day out." — Robert Collier
          </p>
  
          {/* View Buttons */}
          <div className="flex gap-4 mb-8 justify-center">
            {['daily', 'weekly', 'monthly'].map((type) => (
              <button
                key={type}
                onClick={() => setView(type)}
                className={`px-5 py-2 rounded-lg font-medium transition-all duration-300 ${
                  view === type
                    ? 'bg-white text-blue-700 shadow-lg scale-105'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
  
          {/* Stats Component */}
          <div className="w-full max-w-3xl bg-white bg-opacity-10 rounded-xl p-6 shadow-md backdrop-blur-md mb-6">
            <Stats tasks={tasks} missed={missed} view={view} />
          </div>
  
          {/* Summary Section */}
          <div className="text-center mb-10">
            <h2 className="text-xl font-semibold mb-2">📅 Overview</h2>
            <p className="text-gray-200">
              You have completed <span className="font-bold text-green-300">{tasks.length}</span> tasks,
              and missed <span className="font-bold text-red-300">{missed.length}</span>.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}  