const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Student Todo App Servers...\n');

// Start Flask backend server
const flaskServer = spawn('python', ['app.py'], {
    cwd: path.join(__dirname, 'backend'),
    stdio: 'inherit',
    shell: true
});

console.log('📡 Flask backend server starting on port 5000...');

// Start chat server
const chatServer = spawn('node', ['chat_server.js'], {
    cwd: path.join(__dirname, 'backend'),
    stdio: 'inherit',
    shell: true
});

console.log('💬 Chat server starting on port 3001...\n');

// Handle process termination
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down servers...');
    flaskServer.kill('SIGINT');
    chatServer.kill('SIGINT');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 Shutting down servers...');
    flaskServer.kill('SIGTERM');
    chatServer.kill('SIGTERM');
    process.exit(0);
});

// Handle server crashes
flaskServer.on('close', (code) => {
    console.log(`❌ Flask server exited with code ${code}`);
    if (code !== 0) {
        chatServer.kill();
        process.exit(1);
    }
});

chatServer.on('close', (code) => {
    console.log(`❌ Chat server exited with code ${code}`);
    if (code !== 0) {
        flaskServer.kill();
        process.exit(1);
    }
});

console.log('✅ Both servers are running!');
console.log('🌐 Main app: http://localhost:3000');
console.log('💬 Chat server: http://localhost:3001');
console.log('📊 Health check: http://localhost:3001/health\n'); 