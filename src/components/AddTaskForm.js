
import axios from 'axios';

<form onSubmit={handleSubmit} className="add-task-form">
  <input
    type="text"
    placeholder="Title"
    value={title}
    onChange={(e) => setTitle(e.target.value)}
  />
  <input
    type="text"
    placeholder="Description"
    value={description}
    onChange={(e) => setDescription(e.target.value)}
  />
  <label style={{ alignSelf: 'flex-start', marginLeft: '30%' }}>Due Date:</label>
  <input
    type="date"
    value={dueDate}
    onChange={(e) => setDueDate(e.target.value)}
    style={{ width: '40%', margin: '10px 0', padding: '12px', fontSize: '16px', border: '1px solid #ccc', borderRadius: '8px' }}
  />
  <button type="submit">Add Task</button>
</form>
