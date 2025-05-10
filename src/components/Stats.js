import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Stats({ tasks, missed, view }) {
  const today = new Date();

  const parseDate = (dateStr) => {
    const [year, month, day] = dateStr.split('-');
    return new Date(year, month - 1, day);
  };

  const isSameDay = (date1, date2) =>
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear();

  const isSameWeek = (date1, date2) => {
    const weekStart = (date) => {
      const day = date.getDay();
      return new Date(date.getFullYear(), date.getMonth(), date.getDate() - day);
    };
    return weekStart(date1).getTime() === weekStart(date2).getTime();
  };

  const isSameMonth = (date1, date2) =>
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear();

  let filteredTasks = [];

  if (view === 'daily') {
    filteredTasks = tasks.filter(task => {
      const taskDate = parseDate(task.dueDate);
      return isSameDay(taskDate, today);
    });
  } else if (view === 'weekly') {
    filteredTasks = tasks.filter(task => {
      const taskDate = parseDate(task.dueDate);
      return isSameWeek(taskDate, today);
    });
  } else if (view === 'monthly') {
    filteredTasks = tasks.filter(task => {
      const taskDate = parseDate(task.dueDate);
      return isSameMonth(taskDate, today);
    });
  }

  const completed = filteredTasks.filter(task => task.completed).length;
  const pending = filteredTasks.length - completed;
  const missedCount = missed.length;

  const percentage = Math.round((completed / (filteredTasks.length || 1)) * 100); // Avoid division by 0

  const doughnutData = {
    labels: ['Completed', 'Pending', 'Missed'],
    datasets: [
      {
        data: [completed, pending, missedCount],
        backgroundColor: ['#4CAF50', '#FF6384', '#FFA500'],
        borderColor: ['#fff', '#fff', '#fff'],
      },
    ],
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-center">{view.toUpperCase()} STATS</h2>

      {/* Doughnut Chart */}
      <div className="flex justify-center">
        <Doughnut
          data={doughnutData}
          width={200}
          height={200}
          options={{
            maintainAspectRatio: false,
            responsive: false,
          }}
        />
      </div>

      {/* Task Stats */}
      <div className="space-y-2 text-lg text-center">
        <p>Total Tasks: {filteredTasks.length}</p>
        <p>Completed Tasks: {completed}</p>
        <p>Pending Tasks: {pending}</p>
        <p>Missed Tasks (Overall): {missedCount}</p>
      </div>

      {/* Badge */}
      {completed >= 5 && (
        <div className="text-green-400 text-lg font-semibold text-center">
          🏆 You've earned a badge!
        </div>
      )}
    </div>
  );
}
