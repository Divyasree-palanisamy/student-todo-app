import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function Stats({ tasks, missed, view }) {
  const today = new Date();

  // Simplified parseDate to handle any valid date string properly
  const parseDate = (dateStr) => new Date(dateStr);

  const isSameDay = (d1, d2) =>
    d1.getDate() === d2.getDate() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear();

  const isSameWeek = (d1, d2) => {
    const startOfWeek = (date) => {
      const day = date.getDay();
      return new Date(date.getFullYear(), date.getMonth(), date.getDate() - day);
    };
    return startOfWeek(d1).getTime() === startOfWeek(d2).getTime();
  };

  const isSameMonth = (d1, d2) =>
    d1.getMonth() === d2.getMonth() &&
    d1.getFullYear() === d2.getFullYear();

  const filterTasksByView = () => {
    return tasks.filter(task => {
      const taskDate = parseDate(task.dueDate || task.due_date);
      if (!taskDate || isNaN(taskDate)) return false;
      if (view === 'daily') return isSameDay(taskDate, today);
      if (view === 'weekly') return isSameWeek(taskDate, today);
      if (view === 'monthly') return isSameMonth(taskDate, today);
      return false;
    });
  };

  const filteredTasks = filterTasksByView();
  const completed = filteredTasks.filter(t => t.completed).length;
  const pending = filteredTasks.length - completed;
  const missedCount = filteredTasks.filter(task => !task.completed && parseDate(task.dueDate) < today).length;
  const percentage = Math.round((completed / (filteredTasks.length || 1)) * 100);

  const doughnutData = {
    labels: ['Completed', 'Pending', 'Missed'],
    datasets: [
      {
        data: [completed, pending, missedCount],
        backgroundColor: ['#4CAF50', '#FF6384', '#FFA500'],
        borderColor: ['#ffffff', '#ffffff', '#ffffff'],
      },
    ],
  };

  const badgeMessage =
    completed >= 10
      ? '🥇 Super Achiever Badge!'
      : completed >= 5
        ? '🏆 Consistent Performer!'
        : null;

  return (
    <div className="min-h-screen h-screen p-6 bg-white dark:bg-gray-900 transition-colors duration-300 flex items-center justify-center">
      <div
        className="space-y-6 max-w-xl w-full rounded-2xl shadow-lg p-6 bg-white dark:bg-gray-900"
        style={{ minHeight: 400 }}
      >
        <h2 className="text-3xl font-bold text-center text-gray-800 dark:text-white">
          {view.toUpperCase()} STATS
        </h2>

        {/* Doughnut Chart */}
        <div className="flex justify-center">
          <div className="w-[300px] h-[300px] relative">
            <Doughnut
              key={`${view}-${filteredTasks.length}-${completed}-${missedCount}`} // force rerender on data change
              data={doughnutData}
              options={{
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                  legend: {
                    display: true,
                    position: 'bottom',
                    labels: { color: '#ccc' },
                  },
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        return `${label}: ${value}`;
                      },
                    },
                  },
                },
              }}
              plugins={[
                {
                  id: 'centerText',
                  beforeDraw: (chart) => {
                    const { width, height, ctx } = chart;
                    ctx.save();
                    const fontSize = Math.min(width, height) / 6;
                    ctx.font = `${fontSize}px sans-serif`;
                    ctx.textBaseline = 'middle';
                    ctx.textAlign = 'center';
                    const text = `${percentage}%`;
                    const centerX = width / 2;
                    const centerY = height / 2;
                    ctx.fillStyle = '#4CAF50';
                    ctx.fillText(text, centerX, centerY);
                    ctx.restore();
                  },
                },
              ]}
            />
          </div>
        </div>

        {/* Stats Text */}
        {filteredTasks.length === 0 ? (
          <p className="text-center text-gray-400 dark:text-gray-500">No tasks for this view.</p>
        ) : (
          <div className="text-lg text-center space-y-2 text-gray-700 dark:text-gray-200">
            <p>Total Tasks: <span className="font-semibold">{filteredTasks.length}</span></p>
            <p className="text-green-500">Completed: {completed}</p>
            <p className="text-yellow-500">Pending: {pending}</p>
            <p className="text-red-500">Missed: {missedCount}</p>
            <p className="text-indigo-600 dark:text-indigo-300 font-medium">Completion Rate: {percentage}%</p>
          </div>
        )}

        {/* Badge */}
        {badgeMessage && (
          <div className="text-center text-xl font-semibold text-amber-500">
            {badgeMessage}
          </div>
        )}
      </div>
    </div>
  );
}
