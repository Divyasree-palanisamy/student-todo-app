import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';

function Signup() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState(''); // ✅ ADDED

  const handleSignup = async (e) => {
    e.preventDefault();

    const users = JSON.parse(localStorage.getItem('users')) || {};

    if (users[email]) {
      toast.error("User already exists! Please login.");
      return;
    }

    // Store in localStorage as fallback
    users[email] = { username, password, phone, tasks: [], missed: [] };
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('phone', phone); // Optional

    try {
      // Send to backend and trigger SMS
      await axios.post('http://localhost:5000/api/users', {
        email,
        username,
        password,
        phone,
      });
      toast.success("Signup Successful! Welcome message sent.");
      navigate('/login');
    } catch (error) {
  console.error('❌ Error syncing with server:', error.response?.data || error.message);
  toast.error("Signup failed to sync with backend: " + (error.response?.data || error.message));
}
};


  return (
    <div className="auth-page">
      <h2>Signup</h2>
      <form onSubmit={handleSignup} className="auth-form">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
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
        <input
          type="tel"
          placeholder="Phone Number (e.g. +911234567890)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          required
        />
        <button type="submit" className="auth-button">Signup</button>
      </form>

      <p>Already have an account? <Link to="/login" className="auth-link">Login here</Link></p>
    </div>
  );
}

export default Signup;
