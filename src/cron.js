
const cron = require('node-cron');
const axios = require('axios');
require('dotenv').config();

// Get users from localStorage (in a real app, use a database)
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../users_data.json');

const getUsers = () => {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      return Object.entries(data.users).map(([email, userData]) => ({
        email,
        ...userData
      }));
    }
    return [];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
};


// Send notification using our existing endpoint
// Send notification using our existing endpoint
const sendNotification = async (phone, message) => {
  try {
    await axios.post('http://localhost:5000/sendNotification', {
      phone,
      message
    });
    console.log(`Notification sent to ${phone}`);
  } catch (error) {
    console.error(`Failed to send notification:`, error.response?.data || error.message);
  }
};


// Schedule daily notifications at 9 AM
cron.schedule('0 9 * * *', async () => {
  console.log('Sending daily task reminders');
  
  const users = getUsers();
  const today = new Date().toISOString().split('T')[0];
  
  for (const user of users) {
    if (!user.phone) continue; // Skip users without phone numbers
    
    let message = '';
    
    // Check user's task status
    if (!user.tasks || user.tasks.length === 0) {
      // No tasks - remind to add some
      message = `Hello ${user.username}! You don't have any tasks in your Student Todo App. Would you like to add some important tasks today?`;
    } else {
      // Check for pending tasks
      const pendingTasks = user.tasks.filter(task => !task.completed);
      
      if (pendingTasks.length === 0) {
        // All tasks completed
        message = `Great job ${user.username}! You've completed all your tasks. Would you like to add new tasks for today?`;
      } else {
        // Has pending tasks - remind about them
        message = `Reminder: You have ${pendingTasks.length} pending task(s) in your Student Todo App.`;
        
        // List up to 3 pending tasks
        if (pendingTasks.length <= 3) {
          const taskList = pendingTasks.map(task => `- ${task.title}`).join('\n');
          message += `\n\nYour pending tasks:\n${taskList}`;
        }
      }
    }
    
    // Send the notification
    await sendNotification(user.phone, message);
  }
});

