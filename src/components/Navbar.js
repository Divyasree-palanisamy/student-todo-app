import React from 'react';
import { Link } from 'react-router-dom';

function Navbar({ theme, setTheme }) {
  return (
    <nav className="navbar">
      <div className="navbar-left">
        <h2>Task Manager</h2>
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
