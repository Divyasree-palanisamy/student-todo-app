import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

function Login({ setCurrentUser, notifyWhatsApp }) {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      const userData = {
        email: data.email,
        username: data.username,
      };

      // Store token and user info from backend
      localStorage.setItem('token', data.token);
      localStorage.setItem('currentUser', JSON.stringify(userData));

      // Update the state in App.js
      setCurrentUser(userData);

      toast.success(`Welcome back, ${data.username}!`);

      // Check if it's a new user's first login
      const isNewUser = localStorage.getItem('isNewUser');
      if (isNewUser) {
        await notifyWhatsApp(`👋 Welcome to Student Todo App, ${data.username}! 🎉🎉🎉\n\n🎯 Plan your goals.\n🧠 Organize your thoughts.\n🚀 Achieve more every day!\n\nLet's begin your journey to success. 💡`);
        localStorage.removeItem('isNewUser'); // Clear the flag
      } else {
        // Send standard login notification for returning users
        await notifyWhatsApp(`🎉 Successfully logged in as ${data.username}!`);
      }

      navigate('/home', { replace: true }); // Go to home after successful login
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div
      className="login-bg"
      style={{
        background: "url('/login-bg-image.png') center center/cover no-repeat, linear-gradient(120deg, #2193b0 0%, #6dd5ed 100%)",
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 0
      }}
    >
      <div className="login-split-card">
        <div className="login-form-side">
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <input
              type="email"
              placeholder="Email"
              value={email}
              autoComplete="username"
              onChange={e => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              autoComplete="current-password"
              onChange={e => setPassword(e.target.value)}
              required
            />
            <button type="submit">Sign In</button>
          </form>
        </div>
        <div className="login-illustration-side">
          <img src="/login-illustration.png" alt="Login Illustration" />
        </div>
      </div>
    </div>
  );
}

export default Login;
