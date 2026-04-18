import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const EventCard = ({ eventId, title, shortDescription, category, type, dateISO, registrationDeadlineISO, location, capacity, attendeesCount, coverImageUrl, organizerName, onRegister, isRegistered }) => {
  const { isAuthenticated } = useAuth();
  const [registering, setRegistering] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [countdown, setCountdown] = useState({ d: 0, h: 0, m: 0 });
  const [deadlineCountdown, setDeadlineCountdown] = useState({ d: 0, h: 0, m: 0 });

  const placeholderSrc = `https://placehold.co/600x800/eeeeed/1a1c1c?font=playfair-display&text=${title.replace(/\s+/g, '+')}`;
  const imageSrc = !imageError && coverImageUrl ? coverImageUrl : placeholderSrc;

  const eventDate = dateISO ? new Date(dateISO) : null;
  const deadlineDate = registrationDeadlineISO ? new Date(registrationDeadlineISO) : null;

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const dateDisplay = eventDate ? `${monthNames[eventDate.getMonth()]} ${eventDate.getDate().toString().padStart(2, '0')}` : '';

  useEffect(() => {
    const tick = () => {
      const nowMs = Date.now();
      const evtMs = eventDate ? Math.max(0, eventDate.getTime() - nowMs) : 0;
      const dlMs = deadlineDate ? Math.max(0, deadlineDate.getTime() - nowMs) : 0;
      const toObj = (ms) => {
        const d = Math.floor(ms / (1000 * 60 * 60 * 24));
        const h = Math.floor((ms / (1000 * 60 * 60)) % 24);
        const m = Math.floor((ms / (1000 * 60)) % 60);
        return { d, h, m };
      };
      setCountdown(toObj(evtMs));
      setDeadlineCountdown(toObj(dlMs));
    };
    tick();
    const i = setInterval(tick, 60000); // Only tick every minute to reduce re-renders
    return () => clearInterval(i);
  }, [dateISO, registrationDeadlineISO]);

  const handleRegisterClick = async (e) => {
    e.preventDefault();
    if (isRegistered) return;
    if (registering) return;
    setRegistering(true);
    try {
      await onRegister(eventId);
    } finally {
      setRegistering(false);
    }
  };

  const formatCountdown = (cd) => {
    if (cd.d > 0) return `${cd.d}d ${cd.h}h`;
    if (cd.h > 0) return `${cd.h}h ${cd.m}m`;
    if (cd.m > 0) return `${cd.m}m`;
    return 'Now';
  }

  return (
    <Link to={`/events/${eventId}`} className="group flex flex-col h-full cursor-pointer">
      <div className="aspect-[4/3] overflow-hidden rounded-xl mb-4 relative bg-surface-container-highest">
        <img
          src={imageSrc}
          onError={() => setImageError(true)}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          {type && (
            <span className="px-2 py-0.5 bg-primary text-white text-[9px] font-bold uppercase tracking-wider rounded-sm shadow-sm">
              {type === 'online' ? 'Online' : 'In-person'}
            </span>
          )}
          {category && (
            <span className="px-2 py-0.5 bg-tertiary-fixed text-on-tertiary-fixed text-[9px] font-bold uppercase tracking-wider rounded-sm shadow-sm">
              {category}
            </span>
          )}
        </div>
        <div className="absolute top-4 right-4 h-9 w-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform">
          <span className="material-symbols-outlined text-primary text-lg" data-icon="favorite">favorite</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-baseline mb-1">
          <p className="text-[10px] font-label uppercase tracking-widest text-on-surface-variant">
            Organized by: <span className="text-primary font-bold">{organizerName}</span>
          </p>
        </div>

        <h4 className="font-headline text-xl font-black text-primary leading-tight mb-2 group-hover:text-primary/70 transition-colors line-clamp-2">
          {title}
        </h4>
        
        <p className="text-xs text-on-surface-variant font-medium mb-6 line-clamp-2 italic">
          {shortDescription || `Short preview for ${title}`}
        </p>

        <div className="space-y-1.5 mb-4 pt-4 border-t border-outline-variant/30 flex-grow">
          <div className="flex items-center gap-3 text-on-surface-variant">
            <span className="material-symbols-outlined text-base" data-icon="calendar_today">calendar_today</span>
            <span className="text-[11px] font-label uppercase tracking-wider font-bold">
              {eventDate ? eventDate.toLocaleString() : 'TBA'}
            </span>
          </div>
          <div className="flex items-center gap-3 text-on-surface-variant">
            <span className="material-symbols-outlined text-base" data-icon="location_on">location_on</span>
            <span className="text-[11px] font-label uppercase tracking-wider font-bold">
              {location || 'Online'}
            </span>
          </div>
          {capacity != null && (
            <div className="flex items-center gap-3 text-on-surface-variant">
              <span className="material-symbols-outlined text-base" data-icon="groups">groups</span>
              <span className="text-[11px] font-label uppercase tracking-wider font-bold">
                Spots: <span className="text-primary">{attendeesCount != null ? attendeesCount : 0}/{capacity}</span>
              </span>
            </div>
          )}
        </div>

        <div className="mt-auto space-y-4">
          <div className="flex flex-col gap-1.5 px-4 py-3 bg-surface-container-low rounded-lg">
            {eventDate && (
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
                <span className="text-blue-600">Starts in:</span>
                <span className="text-blue-600">{formatCountdown(countdown)}</span>
              </div>
            )}
            {deadlineDate && (
              <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                <span>Reg closes in:</span>
                <span>{formatCountdown(deadlineCountdown)}</span>
              </div>
            )}
            {!eventDate && !deadlineDate && (
               <div className="flex justify-center items-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  Time info not available
               </div>
            )}
          </div>
          
          {isAuthenticated ? (
            isRegistered ? (
               <div className="w-full py-3.5 bg-surface-container-high rounded-lg text-primary text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 cursor-default border border-outline-variant/30 shadow-sm">
                 <span className="material-symbols-outlined text-sm">check_circle</span>
                 Registered
               </div>
            ) : (
               <button 
                 onClick={(e) => {
                     e.preventDefault();
                     handleRegisterClick(e);
                 }} 
                 disabled={registering}
                 className={`w-full py-3.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all shadow-sm ${
                   registering ? 'bg-surface-dim text-on-surface-variant cursor-not-allowed' : 'bg-[#00A86B] text-white hover:brightness-95'
                 }`}
               >
                 {registering ? 'Processing' : 'Register'}
               </button>
            )
          ) : (
            <div className="w-full py-3.5 bg-surface-container-high rounded-lg text-on-surface-variant text-xs font-bold uppercase tracking-widest flex items-center justify-center italic shadow-sm">
                 Sign in to Register
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default EventCard;