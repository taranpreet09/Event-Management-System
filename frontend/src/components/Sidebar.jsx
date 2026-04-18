import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';

const Sidebar = () => {
  const { user, isAuthenticated } = useAuth();
  const { showModal } = useModal();
  const navigate = useNavigate();

  const handleCreateEvent = () => {
    if (!isAuthenticated) return showModal('CHOICE');
    navigate('/dashboard/events/create');
  };

  const navLinkClass = ({ isActive }) =>
    isActive
      ? "bg-[#ffffff] dark:bg-[#00050d] text-[#00050d] dark:text-[#faf9f8] rounded-lg shadow-sm px-4 py-3 flex items-center gap-3 cursor-pointer"
      : "text-slate-500 dark:text-slate-400 px-4 py-3 flex items-center gap-3 hover:bg-[#eeeeed] dark:hover:bg-[#1a1c1c] transition-all duration-200 cursor-pointer rounded-lg";

  return (
    <>
      {/* Desktop Sidebar Navigation */}
      <aside className="fixed left-0 top-0 h-full flex flex-col p-8 z-40 bg-[#f4f3f2] dark:bg-[#121f2c] backdrop-blur-xl w-72 rounded-none shadow-[32px_0_64px_-20px_rgba(0,5,13,0.06)] hidden md:flex">
        <div className="mb-12">
          <Link to="/">
            <h2 className="font-['Noto_Serif'] italic text-base text-[#00050d] dark:text-[#faf9f8]">The Curator Tray</h2>
            <p className="font-['Manrope'] text-[9px] tracking-widest uppercase font-bold text-slate-400">Management Suite</p>
          </Link>
        </div>
        
        <nav className="flex-1 flex flex-col gap-2">
          <NavLink to={isAuthenticated ? "/dashboard" : "/"} end className={navLinkClass}>
            <span className="material-symbols-outlined" data-icon="dashboard_customize">dashboard_customize</span>
            <span className="font-['Manrope'] text-sm tracking-wide uppercase font-bold">{isAuthenticated ? 'Dashboard' : 'Discovery'}</span>
          </NavLink>
          <NavLink to="/events" className={navLinkClass}>
            <span className="material-symbols-outlined" data-icon="confirmation_number">confirmation_number</span>
            <span className="font-['Manrope'] text-sm tracking-wide uppercase font-bold">Events</span>
          </NavLink>
          {isAuthenticated && (
            <>
              <NavLink to="/dashboard/inbox" className={navLinkClass}>
                <span className="material-symbols-outlined" data-icon="inbox">inbox</span>
                <span className="font-['Manrope'] text-sm tracking-wide uppercase font-bold">Inbox</span>
              </NavLink>
              {user?.role === 'organizer' && (
                <NavLink to="/dashboard/broadcast" className={navLinkClass}>
                  <span className="material-symbols-outlined" data-icon="podcasts">podcasts</span>
                  <span className="font-['Manrope'] text-sm tracking-wide uppercase font-bold">Broadcast</span>
                </NavLink>
              )}
              <NavLink to="/dashboard/profile" className={navLinkClass}>
                <span className="material-symbols-outlined" data-icon="settings">settings</span>
                <span className="font-['Manrope'] text-sm tracking-wide uppercase font-bold">Settings</span>
              </NavLink>
            </>
          )}
        </nav>

        {(!isAuthenticated || user?.role === 'organizer') && (
          <button 
            onClick={handleCreateEvent}
            className="mt-auto silk-gradient text-white py-3 px-5 rounded-lg font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform shadow-lg"
          >
            <span className="material-symbols-outlined text-xs" data-icon="add">add</span>
            Create New Event
          </button>
        )}
      </aside>

      {/* Mobile Navigation (Visible only on small screens) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface-container-lowest shadow-[0_-8px_24px_rgba(0,0,0,0.05)] px-6 py-4 flex justify-between items-center z-50">
        <NavLink to={isAuthenticated ? "/dashboard" : "/"} end className={({isActive}) => `flex flex-col items-center gap-1 ${isActive ? 'text-primary' : 'text-slate-400'}`}>
          <span className="material-symbols-outlined" data-icon="dashboard_customize">dashboard_customize</span>
          <span className="text-[10px] font-bold uppercase tracking-tighter">Dash</span>
        </NavLink>
        <NavLink to="/events" className={({isActive}) => `flex flex-col items-center gap-1 ${isActive ? 'text-primary' : 'text-slate-400'}`}>
          <span className="material-symbols-outlined" data-icon="confirmation_number">confirmation_number</span>
          <span className="text-[10px] font-bold uppercase tracking-tighter">Events</span>
        </NavLink>
        
        {(!isAuthenticated || user?.role === 'organizer') ? (
          <button onClick={handleCreateEvent} className="h-12 w-12 silk-gradient rounded-full flex items-center justify-center -mt-10 shadow-lg text-white hover:scale-105 transition-transform cursor-pointer">
            <span className="material-symbols-outlined" data-icon="add">add</span>
          </button>
        ) : (
          <div className="h-12 w-12 bg-surface-container-lowest rounded-full -mt-10" />
        )}

        {isAuthenticated ? (
           <NavLink to="/dashboard/inbox" className={({isActive}) => `flex flex-col items-center gap-1 ${isActive ? 'text-primary' : 'text-slate-400'}`}>
            <span className="material-symbols-outlined" data-icon="inbox">inbox</span>
            <span className="text-[10px] font-bold uppercase tracking-tighter">Inbox</span>
           </NavLink>
        ) : (
            <div className="flex flex-col items-center gap-1 text-slate-400 opacity-50 cursor-not-allowed">
              <span className="material-symbols-outlined" data-icon="inbox">inbox</span>
              <span className="text-[10px] font-bold uppercase tracking-tighter">Inbox</span>
            </div>
        )}

        {isAuthenticated ? (
          <NavLink to="/dashboard/profile" className={({isActive}) => `flex flex-col items-center gap-1 ${isActive ? 'text-primary' : 'text-slate-400'}`}>
            <span className="material-symbols-outlined" data-icon="settings">settings</span>
            <span className="text-[10px] font-bold uppercase tracking-tighter">Settings</span>
          </NavLink>
        ) : (
           <button onClick={() => showModal('CHOICE')} className="flex flex-col items-center gap-1 text-slate-400">
              <span className="material-symbols-outlined" data-icon="login">login</span>
              <span className="text-[10px] font-bold uppercase tracking-tighter">Login</span>
           </button>
        )}
      </nav>
    </>
  );
};

export default Sidebar;