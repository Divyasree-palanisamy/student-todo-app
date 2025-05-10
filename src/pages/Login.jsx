import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();

    const users = JSON.parse(localStorage.getItem('users')) || {};

    if (!users[email]) {
      toast.error("User does not exist! Please signup first.");
      return;
    }

    if (users[email].password !== password) {
      toast.error("Incorrect password!");
      return;
    }

    localStorage.setItem('currentUser', email);
    toast.success(`Welcome you, ${users[email].username}!`);

    navigate('/home'); // Go to home after successful login
  };

  return (
<div className="auth-page">
      <h2>Login</h2>
      <form onSubmit={handleLogin}  className="auth-form">
        <input 
          type="email" 
          placeholder="Email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
    <button type="submit" className="auth-button">Login</button>
      </form>

      {/* Link to signup page */}
  <p>Don't have an account? <Link to="/signup" className="auth-link">Signup here</Link></p>
    </div>
  );
}

export default Login;
