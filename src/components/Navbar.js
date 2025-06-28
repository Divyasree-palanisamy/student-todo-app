import React from 'react';
import { Link } from 'react-router-dom';

function Navbar({ currentUser, handleLogout }) {
  return (
    <nav className="navbar">
      <div className="navbar-left" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <img
          src="/logo1.png"
          alt="Logo"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            objectFit: 'cover',
            backgroundColor: 'white',
          }}
        />
        <h2 style={{ margin: 0 }}>Task Manager</h2>
      </div>
      <div className="navbar-right">
        {currentUser ? (
          <>
            <Link to="/home" className="navbar-link">Home</Link>
            <Link to="/missed" className="navbar-link">Missed</Link>
            <Link to="/stats" className="navbar-link">Stats</Link>
            <Link to="/study-material" className="navbar-link">Study Material</Link>
            <Link to="/chat" className="navbar-link">Chat</Link>
            <button onClick={handleLogout} className="navbar-button logout-button">Logout</button>
          </>
        ) : (
          <>
            {/* You can add links for Login/Signup here if needed when logged out */}
          </>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
