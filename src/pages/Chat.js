import React, { useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-toastify';

function Chat() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [username, setUsername] = useState('');
    const [tempUsername, setTempUsername] = useState('');
    const [showUsernameModal, setShowUsernameModal] = useState(true);
    const [socket, setSocket] = useState(null);
    const chatEndRef = useRef(null);

    // Initialize socket connection
    useEffect(() => {
        const newSocket = io('http://localhost:3001', {
            transports: ['websocket', 'polling']
        });

        setSocket(newSocket);

        // Cleanup on unmount
        return () => {
            newSocket.close();
        };
    }, []);

    // Set up socket event listeners
    useEffect(() => {
        if (!socket) return;

        // Chat messages
        socket.on('chat message', (data) => {
            console.log('Received message:', data);
            setMessages((prev) => [...prev, data]);
        });

        // User joined/left notifications
        socket.on('user joined', (username) => {
            toast.info(`${username} joined the chat`);
        });

        socket.on('user left', (username) => {
            toast.info(`${username} left the chat`);
        });

        // Connection events for debugging
        socket.on('connect', () => {
            console.log('Connected to chat server');
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from chat server');
        });

        socket.on('connect_error', (error) => {
            console.error('Connection error:', error);
            toast.error('Failed to connect to chat server');
        });

        return () => {
            socket.off('chat message');
            socket.off('user joined');
            socket.off('user left');
            socket.off('connect');
            socket.off('disconnect');
            socket.off('connect_error');
        };
    }, [socket]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleUsernameSubmit = () => {
        const nameToSet = tempUsername.trim() || 'Anonymous';
        setUsername(nameToSet);
        setShowUsernameModal(false);
        if (socket) {
            socket.emit('user joined', nameToSet);
        }
    };

    const send = () => {
        if (input.trim() !== '' && socket && username) {
            const msgData = {
                user: username,
                text: input,
                timestamp: new Date().toLocaleTimeString()
            };

            console.log('Sending message:', msgData);
            socket.emit('chat message', msgData);

            // Don't add to local state immediately - wait for server broadcast
            setInput('');
        }
    };

    return (
        <div className="chat-page" style={{
            backgroundImage: "url('/modern-aesthetic-bg.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
            backgroundRepeat: "no-repeat"
        }}>
            <div className="chat-container">
                {showUsernameModal && (
                    <div className="username-modal">
                        <div className="modal-content">
                            <h2>Enter Your Username</h2>
                            <input
                                type="text"
                                value={tempUsername}
                                onChange={(e) => setTempUsername(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleUsernameSubmit()}
                                placeholder="Type your name"
                                autoFocus
                            />
                            <button onClick={handleUsernameSubmit}>Join Chat</button>
                        </div>
                    </div>
                )}

                <div className="chat-header">
                    <h1>💬 Student Chat Room</h1>
                </div>

                <div className="messages-container">
                    <ul className="messages-list">
                        {messages.map((msg, idx) => (
                            <li key={idx} className={`message ${msg.user === username ? 'own-message' : 'other-message'}`}>
                                <div className="message-header">
                                    <strong>{msg.user}</strong>
                                    <span className="timestamp" style={{ marginLeft: '10px' }}>{msg.timestamp}</span>
                                </div>
                                <div className="message-text" style={{ whiteSpace: 'pre-wrap' }}>
                                    {msg.text}
                                </div>
                            </li>
                        ))}
                        <div ref={chatEndRef} />
                    </ul>
                </div>

                <div className="chat-input">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.shiftKey) {
                                e.preventDefault();
                                send();
                            }
                        }}
                        placeholder="Type your message... (Shift+Enter to send)"
                        disabled={!username}
                        rows="1"
                        style={{
                            resize: 'none',
                            minHeight: '40px',
                            maxHeight: '120px',
                            overflowY: 'auto',
                            width: '100%',
                            padding: '12px 16px',
                            border: '2px solid #e0e0e0',
                            borderRadius: '25px',
                            fontSize: '1rem',
                            outline: 'none',
                            transition: 'border-color 0.2s ease',
                            fontFamily: 'inherit'
                        }}
                        onFocus={(e) => {
                            e.target.style.borderColor = '#1971c2';
                        }}
                        onBlur={(e) => {
                            e.target.style.borderColor = '#e0e0e0';
                        }}
                    />
                    <button onClick={send} disabled={!input.trim() || !username}>
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}

export default Chat; 