import React from 'react';
import { Link } from 'react-router-dom';

function Navbar({ theme, setTheme }) {
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
        <button onClick={() => setTheme('default-theme')}>Default</button>
        <button onClick={() => setTheme('light-theme')}>Light</button>
        <button onClick={() => setTheme('dark-theme')}>Dark</button>
       
      </div>
    </nav>
  );
}

export default Navbar;
