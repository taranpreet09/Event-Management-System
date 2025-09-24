import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
  const { user, logout } = useAuth();

 const commonLinks = [
    { path: '/dashboard/profile', name: 'My Profile' }, 
  ];
  const userLinks = [
    { path: '/dashboard', name: 'Registered Events' },
    ...commonLinks
  ];

  const organizerLinks = [
    { path: '/dashboard', name: 'My Events' },
    { path: '/create-event', name: 'Create Event' },
    ...commonLinks
  ];

  const links = user?.role === 'organizer' ? organizerLinks : userLinks;

  const linkClass =
    "block px-4 py-2 rounded-md text-gray-700 hover:bg-indigo-100 hover:text-indigo-600 transition-colors";
  const activeLinkClass =
    "block px-4 py-2 rounded-md bg-indigo-500 text-white font-semibold";

  return (
    <aside className="w-64 bg-white shadow-md p-4 flex flex-col">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800">Dashboard</h2>
        <p className="text-sm text-gray-500">Welcome, {user?.name}</p>
      </div>
      <nav className="flex-grow">
        <ul className="space-y-2">
          {links.map((link) => (
            <li key={link.path}>
              <NavLink
                to={link.path}
                end
                className={({ isActive }) =>
                  isActive ? activeLinkClass : linkClass
                }
              >
                {link.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="mt-auto">
        <button 
          onClick={logout} 
          className={`w-full text-left ${linkClass}`}
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
