import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useModal } from '../context/ModalContext';

const Navbar = ({ notifications, hasUnseen, onView, onClear }) => {
  const { isAuthenticated, user, logout } = useAuth(); 
  const { showModal } = useModal();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);

  const handleBellClick = () => {
    setIsDropdownOpen(!isDropdownOpen);
    if (!isDropdownOpen) {
      onView();
    }
    setIsUserDropdownOpen(false);
  };

  const handleClearClick = () => {
    onClear();
    setIsDropdownOpen(false);
  };

  const handleAvatarClick = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
    setIsDropdownOpen(false);
  }

  return (
    <header className="sticky top-0 z-30 bg-[#faf9f8] dark:bg-[#00050d] flex justify-between items-center w-full px-8 md:px-12 py-6 border-none transition-colors duration-500">
      <div className="flex items-center gap-8">
        {/* We only show title on larger screens if sidebar is collapsed, or maybe always show it. HTML had it shown. */}
        <Link to="/">
          <h1 className="font-['Noto_Serif'] text-xl font-black uppercase tracking-tighter text-[#00050d] dark:text-[#faf9f8]">THE CURATOR</h1>
        </Link>
        {/* Primary nav links removed as requested */}
      </div>

      <div className="flex items-center gap-6">
        {/* Search bar removed as requested */}

        <div className="flex items-center gap-4 relative">
          {isAuthenticated ? (
             <>
               {/* Notifications */}
               <div className="relative">
                 <span 
                   className="material-symbols-outlined text-on-background cursor-pointer hover:text-primary transition-colors" 
                   data-icon="notifications"
                   onClick={handleBellClick}
                 >
                   notifications
                 </span>
                 {hasUnseen && (
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-error"></span>
                    </span>
                 )}

                 {/* Notifications Dropdown */}
                 {isDropdownOpen && (
                   <div className="absolute right-0 mt-4 w-80 bg-surface rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-50 ring-1 ring-on-surface/5 overflow-hidden">
                     <div className="py-3 px-4 border-b border-outline-variant/10 flex justify-between items-center">
                       <span className="font-label text-xs uppercase tracking-widest font-bold text-primary">Notifications</span>
                       {notifications.length > 0 && (
                         <button 
                           onClick={handleClearClick}
                           className="text-on-surface-variant hover:text-primary transition-colors"
                           title="Clear all notifications"
                         >
                           <span className="material-symbols-outlined text-lg">delete_sweep</span>
                         </button>
                       )}
                     </div>
                     
                     <div className="max-h-64 overflow-y-auto">
                       {notifications.length > 0 ? (
                         notifications.map((notif) => (
                           <div key={notif.id} className="px-4 py-3 border-b border-outline-variant/5 hover:bg-surface-container-low transition-colors">
                             <p className="font-label text-sm font-bold text-primary">{notif.title}</p>
                             <p className="text-xs text-on-surface-variant mt-1 font-body">{notif.text}</p>
                             {notif.organizerName && (
                               <p className="text-[10px] text-outline mt-1.5 font-label uppercase tracking-wider">From: {notif.organizerName}</p>
                             )}
                           </div>
                         ))
                       ) : (
                         <div className="py-8 text-center">
                           <span className="material-symbols-outlined text-3xl text-outline-variant mb-2 block">inbox</span>
                           <p className="text-sm text-on-surface-variant font-body">No new notifications</p>
                         </div>
                       )}
                     </div>
                   </div>
                 )}
               </div>

               {/* User Avatar & Dropdown */}
               <div className="relative">
                 <div 
                   onClick={handleAvatarClick} 
                   className="w-10 h-10 rounded-full border border-outline-variant/20 overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                 >
                   <img 
                     alt="User profile avatar" 
                     className="w-full h-full object-cover" 
                     src={user?.profileImage || `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(user?.name || 'U')}&backgroundColor=1a1c1c&textColor=faf9f8`}
                     onError={(e) => { e.target.src = `https://api.dicebear.com/8.x/initials/svg?seed=${encodeURIComponent(user?.name || 'U')}&backgroundColor=1a1c1c&textColor=faf9f8`; }}
                   />
                 </div>

                 {isUserDropdownOpen && (
                   <div className="absolute right-0 mt-4 w-48 bg-surface rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] z-50 ring-1 ring-on-surface/5 overflow-hidden flex flex-col py-2">
                     <div className="px-4 py-2 border-b border-outline-variant/10 mb-2">
                       <p className="font-bold text-sm text-on-surface truncate">{user?.name}</p>
                       <p className="text-xs text-on-surface-variant truncate">{user?.email}</p>
                     </div>
                     <Link to="/dashboard/profile" className="px-4 py-2 text-sm text-on-surface-variant hover:bg-surface-container-low hover:text-primary transition-colors text-left">My Profile</Link>
                     <button onClick={logout} className="px-4 py-2 text-sm text-error hover:bg-error-container hover:text-on-error-container transition-colors text-left w-full">Logout</button>
                   </div>
                 )}
               </div>
             </>
          ) : (
             <button 
               onClick={() => showModal('CHOICE')} 
               className="bg-primary text-on-primary px-5 py-2 rounded-lg text-[10px] font-semibold font-label uppercase tracking-widest hover:opacity-90 transition-opacity"
             >
               Sign In
             </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;