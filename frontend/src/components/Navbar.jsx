import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';

const Navbar = () => {
  // Make sure 'user' is included here
  const { isAuthenticated, user, logout } = useAuth(); 
  const { showModal } = useModal();

  // The main dashboard path is now the same for everyone
  const dashboardPath = '/dashboard';

return (
    // Softer shadow, more padding, and a subtle border
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-200">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-indigo-600 font-heading">EventManager</Link>
        <div className="flex items-center space-x-6">
          <NavLink to="/" className={({ isActive }) => isActive ? "text-indigo-600 font-bold" : "text-gray-600 hover:text-indigo-600 font-medium"}>Home</NavLink>
          <NavLink to="/events" className={({ isActive }) => isActive ? "text-indigo-600 font-bold" : "text-gray-600 hover:text-indigo-600 font-medium"}>Events</NavLink>
          
          {isAuthenticated ? (
            <>
              <NavLink to="/dashboard" className={({ isActive }) => isActive ? "text-indigo-600 font-bold" : "text-gray-600 hover:text-indigo-600 font-medium"}>Dashboard</NavLink>
              <button onClick={logout} className="text-gray-600 hover:text-indigo-600 font-medium">Logout</button>
            </>
          ) : (
            <button 
              onClick={() => showModal('CHOICE')} 
              // Updated button styles for a modern look
              className="bg-indigo-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-indigo-700 transition-transform transform hover:scale-105 shadow-md hover:shadow-lg"
            >
              Login / Sign Up
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;