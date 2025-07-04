import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';

function Signup() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    phone: '+917010669571',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Basic validation
    if (!formData.username || !formData.email || !formData.password) {
      setError('Please fill in all required fields.');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }

      toast.success('Signup successful! Please log in.');
      // Set a flag to indicate a new user just signed up
      localStorage.setItem('isNewUser', 'true');
      navigate('/login', { replace: true });
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
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
          <h2>Signup</h2>
          <form onSubmit={handleSignup}>
            {error && <p className="error-message">{error}</p>}
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
              required
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <button type="submit" disabled={loading}>
              {loading ? 'Signing up...' : 'Signup'}
            </button>
          </form>
          <p>
            Already have an account? <Link to="/login" className="auth-link">Login here</Link>
          </p>
        </div>
        <div className="login-illustration-side">
          <img src="/login-illustration.png" alt="Signup Illustration" />
        </div>
      </div>
    </div>
  );
}

export default Signup;
