import { useNavigate } from 'react-router-dom';

function Missed({ missed, completeMissedTask, deleteMissedTask }) {
  const navigate = useNavigate();

  return (
    <div className="app-container"> {/* Use app-container to apply full background */}
      {/* Navbar */}
      <nav className="navbar">
        <div className="navbar-left"></div>
        <div className="navbar-right">
          <button onClick={() => navigate("/")}>🏠 Home</button>
          <button onClick={() => navigate("/missed")}>⏰ Missed Tasks</button>
        </div>
      </nav>

      {/* Main Content */}
      <div className="content">
        <h1>Missed Tasks</h1>

        {/* Task Table */}
        <table className="task-table">
          <thead>
            <tr>
              <th>Task Title</th>
              <th>Task Description</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {missed.length === 0 ? (
              <tr>
                <td colSpan="4">No missed tasks 🎉</td>
              </tr>
            ) : (
              missed.map((task, index) => (
                <tr key={index}>
                  <td>{task.title}</td>
                  <td>{task.description}</td>
                  <td>Missed</td>
                  <td>
                    <button className="complete-btn" onClick={() => completeMissedTask(index)}>
                      Complete
                    </button>
                    <button className="delete-btn" onClick={() => deleteMissedTask(index)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Missed;
