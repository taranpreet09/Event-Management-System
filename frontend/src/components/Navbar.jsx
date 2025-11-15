import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';
import { FaBell, FaTrash } from 'react-icons/fa'; // ⭐ 1. FaTrash icon import karo

// ⭐ 2. Naye props receive karo
const Navbar = ({ notifications, hasUnseen, onView, onClear }) => {
  const { isAuthenticated, user, logout } = useAuth(); 
  const { showModal } = useModal();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dashboardPath = '/dashboard';

  // ⭐ 3. Bell click karne par naya logic
  const handleBellClick = () => {
    setIsDropdownOpen(!isDropdownOpen); // Dropdown ko toggle karo
    
    // Agar dropdown khul raha hai, toh red dot hatao
    if (!isDropdownOpen) {
      onView();
    }
  };

  // ⭐ 4. "Clear All" button ke liye logic
  const handleClearClick = () => {
    onClear(); // App.jsx mein state clear karo
    setIsDropdownOpen(false); // Dropdown band karo
  };

  return (
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
              className="bg-indigo-600 text-white font-bold py-2 px-5 rounded-lg hover:bg-indigo-700 transition-transform transform hover:scale-105 shadow-md hover:shadow-lg"
            >
              Login / Sign Up
            </button>
          )}

          {/* === ⭐ START: NOTIFICATION BELL & DROPDOWN === */}
          <div className="relative">
            {/* 5. Bell Button (onClick logic change) */}
            <button 
              onClick={handleBellClick} // Puraana logic hatake naya lagao
              className="relative text-gray-600 hover:text-indigo-600"
              aria-label="Notifications"
            >
              <FaBell size={20} />
              {/* 6. Red Dot (logic change) */}
              {/* Ab yeh 'hasUnseen' par depend karta hai, 'notifications.length' par nahi */}
              {hasUnseen && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              )}
            </button>

            {/* 7. Dropdown Menu (updated) */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg z-20 border border-gray-200">
                <div className="py-2 px-3 border-b border-gray-200 flex justify-between items-center">
                  <span className="font-semibold text-gray-800">Notifications</span>
                  {/* 8. "Clear All" Button */}
                  {notifications.length > 0 && (
                    <button 
                      onClick={handleClearClick}
                      className="text-sm text-indigo-600 hover:text-indigo-800"
                      title="Clear all notifications"
                    >
                      <FaTrash />
                    </button>
                  )}
                </div>
                
                <div className="py-1 max-h-60 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notif) => ( // Note: reverse() hata diya
                      <div key={notif.id} className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50">
                        <p className="font-semibold text-gray-800">{notif.title}</p>
                        <p className="text-sm text-gray-600">{notif.text}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-4">No new notifications</p>
                  )}
                </div>
              </div>
            )}
          </div>
          {/* === END: NOTIFICATION BELL & DROPDOWN === */}

        </div>
      </nav>
    </header>
  );
};

export default Navbar;