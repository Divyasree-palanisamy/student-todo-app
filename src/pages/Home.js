import { useState } from 'react';
import { useNavigate } from 'react-router-dom';


function Home({ tasks, addTask, completeTask, deleteTask }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (title.trim() && description.trim()) {
      addTask(title, description, dueDate);
      setTitle('');
      setDescription('');
      setDueDate('');
    }
  };

   const handleLogout = () => {
    localStorage.removeItem('currentUser');
    navigate('/login');
  };

  return (
    <div className="home-container">
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-left"></div>
        <div className="navbar-right">
        <button onClick={() => navigate("/study-material")}>📚 Study Material</button>

          <button onClick={() => navigate("/")}>🏠 Home</button>
<button onClick={() => navigate("/missed")}>⏰ Missed Tasks</button>
<button onClick={() => navigate("/Stats")}>📊 Statistics</button>
{/* ADDED THIS BUTTON */}
             {/* 🚀 Logout button here after Statistics */}
      <button onClick={handleLogout} style={{ marginTop: '20px', padding: '10px 20px', background: 'crimson', color: 'white', border: 'none', borderRadius: '5px' }}>
        Logout
      </button>


        </div>
      </nav><div className="welcome-box">
  <h2>👋 Welcome back!</h2>
  <p>Manage your tasks efficiently and never miss a deadline.</p>
</div>

      {/* Main Content */}
      <div className="content"><div className="task-header">
      <img
  src="https://cdn-icons-png.flaticon.com/512/943/943175.png"
  alt="task-icon"
  className="task-icon"
/>

  <h1>Today's Tasks</h1>
</div>

        {/* Task Table */}
        <table className="task-table">
          <thead>
            <tr>
              <th>Task Title</th>
              <th>Task Description</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {tasks.length === 0 ? (
              <tr>
<td colSpan="5" style={{ padding: '30px', fontStyle: 'italic', color: '#777' }}>
  🎉 You have no tasks! Add one using the form below to get started.
</td>
              </tr>
            ) : (
              tasks.map((task, index) => {
                const today = new Date();
                const due = new Date(task.dueDate);
                const isMissed = !task.completed && due < today;

                return (
                  <tr key={index}>
                    <td>{task.title}</td>
                    <td>{task.description}</td>
                    <td>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}</td>
                    <td>{task.completed ? 'Completed' : isMissed ? 'Missed' : 'Pending'}</td>
                    <td>
                      {!task.completed && (
                        <button className="complete-btn" onClick={() => completeTask(index)}>
                          Complete
                        </button>
                      )}
                      <button className="delete-btn" onClick={() => deleteTask(index)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Add Task Form */}
        <div className="add-task-form">
        <hr style={{ margin: '40px 0', borderColor: '#ccc' }} />

          <h2>Add New Task</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Task Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            
            <input
              type="text"
              placeholder="Task Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <label style={{ alignSelf: 'flex-start', marginLeft: '30%' }}>Due Date:</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              style={{
                width: '40%',
                margin: '10px 0',
                padding: '12px',
                fontSize: '16px',
                border: '1px solid #ccc',
                borderRadius: '8px',
              }}
            />
            <button type="submit">Add Task</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Home;
