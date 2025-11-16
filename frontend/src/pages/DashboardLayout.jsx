import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { motion } from 'framer-motion';

const pageMeta = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Overview of your events and activity.' },
  '/dashboard/profile': { title: 'My Profile', subtitle: 'View and update your account details.' },
  '/dashboard/events/create': { title: 'Create Event', subtitle: 'Set up a new event for your attendees.' },
  '/dashboard/broadcast': { title: 'Broadcast', subtitle: 'Send a real-time announcement to active users.' },
  '/dashboard/inbox': { title: 'Inbox', subtitle: 'View messages from and to event organizers.' },
};

const DashboardLayout = () => {
  const location = useLocation();
  const path = location.pathname;

  // Find the closest matching meta entry (handles nested routes like /dashboard/inbox/123)
  const matchedKey = Object.keys(pageMeta)
    .filter((key) => path.startsWith(key))
    .sort((a, b) => b.length - a.length)[0];

  const meta = pageMeta[matchedKey] || pageMeta['/dashboard'];

  const segments = path.split('/').filter(Boolean);

  return (
    <div className="flex min-h-[calc(100vh-150px)]">
      <Sidebar />
      <motion.main
        className="flex-grow p-8 bg-gray-50"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Breadcrumb + page header */}
        <div className="mb-6 border-b border-gray-200 pb-4">
          <nav className="text-sm text-gray-500 mb-2 flex flex-wrap items-center gap-1">
            <Link to="/dashboard" className="hover:text-indigo-600 font-medium">
              Dashboard
            </Link>
            {segments.slice(2).map((segment, idx) => {
              const isLast = idx === segments.slice(2).length - 1;
              const label = segment.replace(/-/g, ' ');
              return (
                <span key={idx} className="flex items-center gap-1">
                  <span>/</span>
                  <span className={isLast ? 'font-semibold text-gray-800 capitalize' : 'capitalize'}>
                    {label}
                  </span>
                </span>
              );
            })}
          </nav>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">{meta.title}</h1>
          <p className="text-gray-600 text-sm md:text-base">{meta.subtitle}</p>
        </div>

        <Outlet />
      </motion.main>
    </div>
  );
};

export default DashboardLayout;
