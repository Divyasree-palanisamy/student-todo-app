
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const { sendSMS, sendWelcomeSMS } = require('./notify');

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Data file
const DATA_FILE = path.join(__dirname, 'users_data.json');

// Twilio credentials check
if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN || !process.env.TWILIO_PHONE_NUMBER) {
  console.error("❌ Missing Twilio credentials in .env file.");
  process.exit(1);
}

// Helper: Read JSON data
const readData = () => {
  try {
    return fs.existsSync(DATA_FILE)
      ? JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
      : { users: {} };
  } catch (error) {
    console.error('❌ Error reading data:', error);
    return { users: {} };
  }
};

// Helper: Save JSON data
const saveUserToFile = (email, userData) => {
  const data = readData();
  data.users[email] = userData;
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('❌ Error writing to file:', error);
  }
};

// Routes
app.get('/', (req, res) => {
  res.send('Welcome to the Student Todo App API!');
});

// ✅ Register user
app.post('/api/users', async (req, res) => {
  const { email, username, password, phone } = req.body;

  if (!email || !username || !password || !phone) {
    return res.status(400).send('All fields are required');
  }

  const data = readData();

  if (data.users[email]) {
    return res.status(409).send('User already exists');
  }

  const userData = {
    username,
    password,
    phone,
    tasks: [],
    missed: []
  };

  saveUserToFile(email, userData);

  try {
    const msg = await sendWelcomeSMS(phone, username);
    console.log('📲 Welcome WhatsApp sent:', msg.sid);
    res.status(201).send('User registered and welcome message sent');
  } catch (err) {
    console.error('❌ Error sending welcome message:', err.message);
    res.status(500).send('User registered but failed to send welcome message');
  }
});

// ✅ Update tasks


app.post('/api/updateTasks', async (req, res) => {
  const { email, tasks } = req.body;

  if (!email || !tasks) {
    return res.status(400).send('Missing data');
  }

  const data = readData();
  const user = data.users[email];

  if (!user) {
    return res.status(404).send('User not found');
  }

  const oldTasks = user.tasks || [];
  user.tasks = tasks;
  saveUserToFile(email, user);

  const { phone, username } = user;

  try {
    // Detect new tasks
    const newTasks = tasks.filter(t => !oldTasks.some(ot => ot.title === t.title));
    for (const task of newTasks) {
      await sendSMS(phone, `🆕 ${username} added a new task: "${task.title}"\n🗓️ Due: ${task.dueDate}`);
    }

    // Detect deleted tasks
    const deletedTasks = oldTasks.filter(ot => !tasks.some(t => t.title === ot.title));
    for (const task of deletedTasks) {
      await sendSMS(phone, `🗑️ ${username} deleted the task: "${task.title}"`);
    }

    // Detect completed tasks
    const completedTasks = tasks.filter(t =>
      t.completed && !oldTasks.find(ot => ot.title === t.title && ot.completed)
    );
    for (const task of completedTasks) {
      await sendSMS(phone, `✅ ${username} completed the task: "${task.title}"`);
    }

    // Detect newly missed tasks
    const missedNow = tasks.filter(t => t.status === 'Missed').length;
    const missedBefore = oldTasks.filter(t => t.status === 'Missed').length;
    if (missedNow > missedBefore) {
      await sendSMS(phone, `⚠️ ${username}, you missed a task! Check your to-do list.`);
    }

    // If all tasks completed
    if (tasks.length > 0 && tasks.every(t => t.completed)) {
      await sendSMS(phone, `🎉 Well done, ${username}! All tasks are completed!`);
    }

    res.json({ success: true });
  } catch (err) {
    console.error('❌ Error sending WhatsApp task update:', err.message);
    res.status(500).json({ error: 'Failed to send one or more messages' });
  }
});


// ✅ Manual WhatsApp notification
app.post('/sendNotification', async (req, res) => {
  const { phone, message } = req.body;

  if (!phone || !message) {
    return res.status(400).send('Missing phone or message');
  }

  try {
    const msg = await sendSMS(phone, message);
    console.log('🔔 Notification sent:', msg.sid);
    res.status(200).send(`Message sent: ${msg.sid}`);
  } catch (error) {
    console.error('❌ Failed to send notification:', error.message);
    res.status(500).send('Failed to send message');
  }
});

// ✅ Debug route: get all users
app.get('/users', (req, res) => {
  const data = readData();
  res.json(data.users);
});

// Cron loader (optional)
try {
  require('./src/cron.js');
} catch (err) {
  console.error('⚠️ Cron job not loaded:', err.message);
}

// Start server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
});
app.post('/signup', async (req, res) => {
  const { username, phone } = req.body;
  const users = readUsers();

  if (users.find(u => u.phone === phone)) {
    return res.status(409).send('Phone number already registered');
  }

  const newUser = { username, phone };
  users.push(newUser);
  writeUsers(users);

  try {
    const msg = await sendWelcomeSMS(phone, username);
    console.log('✅ Welcome message sent:', msg.sid);
    res.status(201).send('User registered and welcome message sent');
  } catch (err) {
    console.error('❌ Error sending welcome message:', err.message);
    res.status(500).send('User registered but failed to send welcome message');
  }
});

