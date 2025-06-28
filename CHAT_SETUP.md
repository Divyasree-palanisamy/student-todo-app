# Chat Functionality Setup Guide

This guide explains how to set up and run the chat functionality that has been integrated into your Student Todo App.

## 🚀 Quick Start

### 1. Install Dependencies

First, install the new dependencies for both frontend and backend:

```bash
# Install frontend dependencies (including socket.io-client)
npm install

# Install backend Node.js dependencies for chat server
cd backend
npm install
cd ..

# Install Python dependencies (if not already done)
cd backend
pip install -r requirements.txt
cd ..
```

### 2. Start Both Servers

You can start both servers (Flask backend + Chat server) using the provided script:

```bash
npm run start-servers
```

Or start them individually:

**Terminal 1 - Flask Backend:**
```bash
cd backend
python app.py
```

**Terminal 2 - Chat Server:**
```bash
cd backend
node chat_server.js
```

**Terminal 3 - React Frontend:**
```bash
npm start
```

### 3. Access the Application

- **Main App**: http://localhost:3000
- **Chat Server Health Check**: http://localhost:3001/health
- **Chat Functionality**: Navigate to the "Chat" tab in the navbar

## 📁 New Files Added

### Frontend
- `src/pages/Chat.js` - Main chat component
- Updated `src/App.js` - Added chat route
- Updated `src/components/Navbar.js` - Added chat link
- Updated `src/App.css` - Added comprehensive chat styles

### Backend
- `backend/chat_server.js` - Socket.IO chat server
- `backend/package.json` - Node.js dependencies for chat server
- Updated `backend/requirements.txt` - Added Python socket.io dependencies

### Root
- `start_servers.js` - Script to run both servers
- Updated `package.json` - Added socket.io-client and scripts

## 🔧 Configuration

### Ports
- **Flask Backend**: Port 5000 (existing)
- **Chat Server**: Port 3001 (new)
- **React Frontend**: Port 3000 (existing)

### Environment Variables
The chat server uses these environment variables (optional):
- `CHAT_PORT` - Port for chat server (default: 3001)

## 💬 Chat Features

### Real-time Messaging
- Instant message delivery
- User join/leave notifications
- Connection status indicator
- Timestamp for each message

### User Experience
- Username modal on first visit
- Responsive design for mobile/desktop
- Message animations
- Auto-scroll to latest messages
- Enter key to send messages

### Technical Features
- Socket.IO for real-time communication
- CORS enabled for cross-origin requests
- Health check endpoint
- User count tracking
- Typing indicators (ready for future use)

## 🛠 Troubleshooting

### Common Issues

1. **"Module not found" errors**
   ```bash
   npm install
   cd backend && npm install
   ```

2. **Port already in use**
   - Check if ports 3001 or 5000 are already in use
   - Kill existing processes or change ports in configuration

3. **Chat not connecting**
   - Ensure chat server is running on port 3001
   - Check browser console for connection errors
   - Verify CORS settings in chat_server.js

4. **Build errors on deployment**
   - Ensure `react-scripts` is in dependencies (not devDependencies)
   - Run `npm install` before building
   - Check that all dependencies are properly installed

### Development vs Production

For production deployment, you'll need to:
1. Update the socket connection URL in `Chat.js` to your production domain
2. Configure CORS origins in `chat_server.js`
3. Set up proper environment variables
4. Ensure both servers are deployed and accessible

## 🔒 Security Considerations

- Chat messages are not persisted (in-memory only)
- No authentication required for chat (separate from main app auth)
- Consider adding rate limiting for production use
- Implement message validation and sanitization if needed

## 📱 Mobile Support

The chat interface is fully responsive and works on:
- Desktop browsers
- Mobile browsers
- Tablet devices

## 🎨 Customization

You can customize the chat appearance by modifying:
- Colors in `src/App.css` (look for "Chat Application Styles")
- Layout in `src/pages/Chat.js`
- Server behavior in `backend/chat_server.js`

## 📞 Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify all servers are running
3. Check the terminal output for server errors
4. Ensure all dependencies are installed correctly 