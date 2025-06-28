const http = require('http');
const { Server } = require('socket.io');
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: ["http://localhost:3000", "http://localhost:5173"], // Allow both React dev server and production
        methods: ['GET', 'POST']
    }
});

// Store connected users
const connectedUsers = new Map();

io.on('connection', (socket) => {
    console.log("New client connected:", socket.id);

    socket.on('user joined', (username) => {
        connectedUsers.set(socket.id, username);
        console.log(`${username} joined the chat`);

        // Notify all other users that someone joined
        socket.broadcast.emit('user joined', username);

        // Send current user count to all users
        io.emit('user count', connectedUsers.size);
    });

    socket.on('chat message', (msg) => {
        console.log('Message received:', msg);
        // Broadcast the message to all connected clients
        io.emit('chat message', msg);
    });

    socket.on('disconnect', () => {
        const username = connectedUsers.get(socket.id);
        if (username) {
            connectedUsers.delete(socket.id);
            console.log(`${username} disconnected`);

            // Notify other users that someone left
            socket.broadcast.emit('user left', username);

            // Send updated user count
            io.emit('user count', connectedUsers.size);
        }
        console.log('Client disconnected:', socket.id);
    });

    // Handle typing indicators
    socket.on('typing', (username) => {
        socket.broadcast.emit('user typing', username);
    });

    socket.on('stop typing', (username) => {
        socket.broadcast.emit('user stop typing', username);
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        connectedUsers: connectedUsers.size,
        timestamp: new Date().toISOString()
    });
});

const PORT = process.env.CHAT_PORT || 3001;

server.listen(PORT, () => {
    console.log(`Chat server running on port ${PORT}`);
    console.log(`Health check available at http://localhost:${PORT}/health`);
});

module.exports = server; 