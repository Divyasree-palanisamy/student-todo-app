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
    <div className="p-4 flex flex-col min-h-screen items-center bg-gray-50">
      {/* View Buttons */}
      <div className="flex gap-4 mb-6 justify-center">
        <button onClick={() => setView('daily')} className="bg-blue-500 text-white px-4 py-2 rounded">
          Daily
        </button>
        <button onClick={() => setView('weekly')} className="bg-blue-500 text-white px-4 py-2 rounded">
          Weekly
        </button>
        <button onClick={() => setView('monthly')} className="bg-blue-500 text-white px-4 py-2 rounded">
          Monthly
        </button>
      </div>

      {/* Stats */}
      <div className="flex-grow flex flex-col items-center w-full max-w-md">
        <Stats tasks={tasks} missed={missed} view={view} />
      </div>

      {/* Back Button */}
      <div className="flex justify-center mt-8 mb-4">
        <button
          onClick={() => navigate('/')}
          style={{
            backgroundColor: '#4CAF50',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
