import { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useLocation, Navigate, useNavigate } from 'react-router-dom';
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
import StudyMaterials from './components/StudyMaterials';

// --- API Helper ---
const getAuthHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    'x-access-token': token,
  };
};

function App() {
  const [tasks, setTasks] = useState([]);
  const [missed, setMissed] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('currentUser');
    if (user) {
      setCurrentUser(JSON.parse(user));
    }
  }, []);

  const fetchTasks = useCallback(async () => {
    if (!currentUser) return;
    try {
      const response = await fetch('/api/tasks', {
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        const data = await response.json();
        const activeTasks = data.filter(task => !task.missed);
        const missedTasks = data.filter(task => task.missed);
        setTasks(activeTasks);
        setMissed(missedTasks);
      } else {
        // Handle token expiry or other errors
        if (response.status === 401) {
          localStorage.removeItem('currentUser');
          localStorage.removeItem('token');
          setCurrentUser(null);
        }
      }
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  }, [currentUser]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const notifyWhatsApp = useCallback(async (message) => {
    try {
      await fetch('/api/send-notification', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ body: message }),
      });
    } catch (error) {
      console.error("Error sending notification:", error);
    }
  }, []);

  const addTask = async (title, description, dueDate) => {
    if (!title.trim()) {
      toast.error("Title cannot be empty");
      return;
    }
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ title, description, dueDate }),
      });
      if (response.ok) {
        toast.success("Task Added!");
        fetchTasks(); // Refetch tasks to update state
        const username = currentUser?.username || 'User';
        await notifyWhatsApp(`🆕 ${username} added a new task: "${title}"\n🗓 Due: ${dueDate}`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to add task');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const completeTask = async (taskId) => {
    try {
      const taskToComplete = tasks.find(t => t.id === taskId);
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ completed: true }),
      });
      if (response.ok) {
        toast.success("Good Job! Task Completed");
        const username = currentUser?.username || 'User';
        await notifyWhatsApp(`✅ ${username} completed the task: "${taskToComplete?.title}"`);
        fetchTasks(); // Refetch
      } else {
        throw new Error('Failed to complete task');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const taskToDelete = tasks.find(t => t.id === taskId);
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        toast.warn("Task deleted");
        const username = currentUser?.username || 'User';
        await notifyWhatsApp(`🗑 ${username} deleted the task: "${taskToDelete?.title}"`);
        fetchTasks(); // Refetch
      } else {
        throw new Error('Failed to delete task');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const completeMissedTask = async (taskId) => {
    try {
      const taskToComplete = missed.find(t => t.id === taskId);
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ completed: true, missed: false }), // Mark as completed and not missed
      });
      if (response.ok) {
        toast.success("Missed Task Completed!");
        const username = currentUser?.username || 'User';
        await notifyWhatsApp(`✅ ${username} completed a missed task: "${taskToComplete?.title}"`);
        fetchTasks(); // Refetch all tasks
      } else {
        throw new Error('Failed to complete missed task');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const deleteMissedTask = async (taskId) => {
    try {
      const taskToDelete = missed.find(t => t.id === taskId);
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      if (response.ok) {
        toast.warn("Missed task deleted.");
        const username = currentUser?.username || 'User';
        await notifyWhatsApp(`🗑 ${username} deleted a missed task: "${taskToDelete?.title}"`);
        fetchTasks(); // Refetch
      } else {
        throw new Error('Failed to delete missed task');
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    setCurrentUser(null);
    toast.success("You have been logged out.");
    navigate('/login', { replace: true });
  };

  return (
    <div className={`App light-theme`}>
      <Navbar currentUser={currentUser} handleLogout={handleLogout} />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route
            path="/study-material"
            element={
              currentUser ? <StudyMaterials /> : <Navigate to="/login" replace />
            }
          />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login setCurrentUser={setCurrentUser} notifyWhatsApp={notifyWhatsApp} />} />
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
                    handleLogout={handleLogout}
                  />
                }
              />
              <Route
                path="/missed"
                element={
                  <Missed
                    missed={missed}
                    deleteMissedTask={deleteMissedTask}
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
