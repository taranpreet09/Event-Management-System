import React from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';

const Navbar = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { showModal } = useModal();

  const dashboardPath = user?.role === 'organizer' ? '/dashboard/organizer' : '/dashboard/user';

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-indigo-600">EventManager</Link>
        <div className="flex items-center space-x-6">
          <NavLink to="/" className={({ isActive }) => isActive ? "text-indigo-600 font-semibold" : "text-gray-600 hover:text-indigo-600"}>Home</NavLink>
          <NavLink to="/events" className={({ isActive }) => isActive ? "text-indigo-600 font-semibold" : "text-gray-600 hover:text-indigo-600"}>Events</NavLink>
          
          {isAuthenticated ? (
            <>
              <NavLink to={dashboardPath} className={({ isActive }) => isActive ? "text-indigo-600 font-semibold" : "text-gray-600 hover:text-indigo-600"}>Dashboard</NavLink>
              <button onClick={logout} className="text-gray-600 hover:text-indigo-600">Logout</button>
            </>
          ) : (
            <button 
              onClick={() => showModal('USER_LOGIN')} 
              className="bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Login
            </button>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;