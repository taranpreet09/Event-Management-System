import React from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { motion } from 'framer-motion';

const pageMeta = {
  '/dashboard': { title: 'Dashboard', subtitle: 'Overview of your events and activity.', hideHeader: true },
  '/dashboard/profile': { title: 'Settings', subtitle: 'Manage your profile, security, and preferences.' },
  '/dashboard/events/create': { title: 'Create Event', subtitle: 'Set up a new event for your attendees.', hideHeader: true },
  '/dashboard/events/': { hideHeader: true },
  '/dashboard/broadcast': { title: null, hideHeader: true },
  '/dashboard/inbox': { title: null, hideHeader: true },
};

const DashboardLayout = () => {
  const location = useLocation();
  const path = location.pathname;

  const matchedKey = Object.keys(pageMeta)
    .filter((key) => path.startsWith(key))
    .sort((a, b) => b.length - a.length)[0];

  const meta = pageMeta[matchedKey] || pageMeta['/dashboard'];
  const segments = path.split('/').filter(Boolean);

  return (
    <div className="flex min-h-[calc(100vh-150px)]">
      <Sidebar />
      <motion.main
        className="flex-grow p-8 bg-background"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Only show header if not hidden */}
        {!meta.hideHeader && (
          <div className="mb-6 border-b border-outline-variant/10 pb-4">
            <nav className="text-[10px] uppercase tracking-[0.2em] font-bold text-on-surface-variant mb-2 flex flex-wrap items-center gap-1">
              <Link to="/dashboard" className="hover:text-primary font-bold">
                Dashboard
              </Link>
              {segments.slice(2).map((segment, idx) => {
                const isLast = idx === segments.slice(2).length - 1;
                const label = segment.replace(/-/g, ' ');
                return (
                  <span key={idx} className="flex items-center gap-1">
                    <span>/</span>
                    <span className={isLast ? 'font-bold text-primary capitalize' : 'capitalize'}>
                      {label}
                    </span>
                  </span>
                );
              })}
            </nav>
            <h1 className="font-['Noto_Serif'] text-2xl md:text-3xl font-bold text-primary mb-1">{meta.title}</h1>
            {meta.subtitle && <p className="text-on-surface-variant text-sm font-light">{meta.subtitle}</p>}
          </div>
        )}

        <Outlet />
      </motion.main>
    </div>
  );
};

export default DashboardLayout;
