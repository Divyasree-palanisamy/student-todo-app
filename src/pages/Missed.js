import { useNavigate } from 'react-router-dom';

function Missed({ missed, completeMissedTask, deleteMissedTask }) {
  const navigate = useNavigate();

  return (
    <div className="app-container">  {/* Use app-container to apply full background */}
      {/* Main Content */}
      <div className="content">
        <h1>⏰ Missed Tasks</h1>

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
            {missed.length === 0 ? (
              <tr>
                <td colSpan="5">No missed tasks 🎉</td>
              </tr>
            ) : (
              missed.map((task) => (
                <tr key={task.id}>
                  <td>{task.title}</td>
                  <td>{task.description}</td>
                  <td>{task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '-'}</td>
                  <td>Missed</td>
                  <td>
                    <button className="complete-btn" onClick={() => completeMissedTask(task.id)}>
                      Complete
                    </button>
                    <button className="delete-btn" onClick={() => deleteMissedTask(task.id)}>
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
