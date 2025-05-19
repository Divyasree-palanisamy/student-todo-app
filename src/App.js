import { useState, useEffect } from 'react';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ToastContainer, toast } from 'react-toastify';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Missed from './pages/Missed';
import StatsPage from './pages/StatsPage';
import Signup from './pages/Signup';
import Login from './pages/Login';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';
import StudyMaterials from './components/StudyMaterials'; // ✅ Import this


function App() {
  const [tasks, setTasks] = useState([]);
  const [missed, setMissed] = useState([]);
  const [theme, setTheme] = useState('default');

  const location = useLocation();
  const currentUser = localStorage.getItem('currentUser');
  const users = JSON.parse(localStorage.getItem('users')) || {};

  useEffect(() => {
    if (currentUser && users[currentUser]) {
      setTasks(users[currentUser].tasks || []);
      setMissed(users[currentUser].missed || []);
    }
  }, [currentUser]);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'default';
    setTheme(savedTheme);
  }, []);

  useEffect(() => {
    if (currentUser) {
      const updatedUsers = { ...users };
      if (!updatedUsers[currentUser]) {
        updatedUsers[currentUser] = { tasks: [], missed: [] };
      }
      updatedUsers[currentUser].tasks = tasks;
      updatedUsers[currentUser].missed = missed;
      localStorage.setItem('users', JSON.stringify(updatedUsers));
    }
    localStorage.setItem('theme', theme);
  }, [tasks, missed, theme, currentUser]);

  // 🔔 Notify WhatsApp on changes
  const notifyWhatsApp = async (msg) => {
    const users = JSON.parse(localStorage.getItem('users'));
    const phone = users?.[currentUser]?.phone;

    if (phone) {
      await fetch('http://localhost:5000/sendNotification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          taskTitle: msg,
          dueDate: new Date().toISOString().split('T')[0],
        }),
      });
    }
  };

  const addTask = async (title, description, dueDate) => {
    if (!title.trim()) {
      toast.error("Title cannot be empty");
      return;
    }

    const newTask = { title, description, dueDate, completed: false };
    const updatedTasks = [...tasks, newTask];
    setTasks(updatedTasks);
    toast.success("Task Added!");
    await notifyWhatsApp(`🆕 Task Added: ${title}`);

    await fetch('http://localhost:5000/api/updateTasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: currentUser, tasks: updatedTasks })
    });
  };

  const completeTask = async (index) => {
    const updatedTasks = [...tasks];
    updatedTasks[index].completed = true;
    setTasks(updatedTasks);
    toast.success("Good Job! Task Completed");
    await notifyWhatsApp(`✅ Task Completed: ${tasks[index].title}`);

    await fetch('http://localhost:5000/api/updateTasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: currentUser, tasks: updatedTasks })
    });
  };

  const deleteTask = async (index) => {
    const unfinishedTask = tasks[index];
    let updatedMissed = [...missed];
    let updatedTasks = tasks.filter((_, i) => i !== index);

    if (!unfinishedTask.completed) {
      updatedMissed = [...missed, unfinishedTask];
      toast.error("Task missed! Added to missed list");
      await notifyWhatsApp(`❌ Task Missed: ${unfinishedTask.title}`);
    }

    setMissed(updatedMissed);
    setTasks(updatedTasks);

    await fetch('http://localhost:5000/api/updateTasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: currentUser, tasks: updatedTasks })
    });
  };

  const completeMissedTask = async (index) => {
    const taskToComplete = missed[index];
    const updatedMissed = missed.filter((_, i) => i !== index);
    const updatedTasks = [...tasks, { ...taskToComplete, completed: true }];

    setMissed(updatedMissed);
    setTasks(updatedTasks);
    toast.success("Missed Task Completed!");

    await fetch('http://localhost:5000/api/updateTasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: currentUser, tasks: updatedTasks })
    });
  };

  return (
    <div className={`App ${theme}`}>
      <Navbar theme={theme} setTheme={setTheme} />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
        <Route path="/study-material" element={<StudyMaterials />} /> {/* ✅ Add this */}

          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={<Navigate to={currentUser ? "/home" : "/signup"} replace />}
          />
          {currentUser ? (
            <>
              <Route
                path="/home"
                element={
                  <Home
                    tasks={tasks}
                    addTask={addTask}
                    completeTask={completeTask}
                    deleteTask={deleteTask}
                  />
                }
              />
              <Route
                path="/missed"
                element={
                  <Missed
                    missed={missed}
                    deleteMissedTask={(index) => {
                      const updatedMissed = missed.filter((_, i) => i !== index);
                      setMissed(updatedMissed);
                      toast.success("Missed Task Deleted");
                    }}
                    completeMissedTask={completeMissedTask}
                  />
                }
              />
              <Route
                path="/stats"
                element={<StatsPage tasks={tasks} missed={missed} />}
              />
            </>
          ) : (
            <Route path="*" element={<Navigate to="/login" replace />} />
          )}
        </Routes>
      </AnimatePresence>
      <ToastContainer />
    </div>
  );
}

export default App;
