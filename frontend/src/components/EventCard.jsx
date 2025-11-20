import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const EventCard = ({ eventId, title, shortDescription, category, type, dateISO, registrationDeadlineISO, location, capacity, attendeesCount, coverImageUrl, organizerName, onRegister, isRegistered }) => {
  const { isAuthenticated } = useAuth();
  const [registering, setRegistering] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [countdown, setCountdown] = useState({ d: 0, h: 0, m: 0, s: 0 });
  const [deadlineCountdown, setDeadlineCountdown] = useState({ d: 0, h: 0, m: 0, s: 0 });

  const placeholderSrc = `https://placehold.co/600x400/a0c4ff/333333?text=${title.replace(/\s+/g, '+')}`;
  const imageSrc = !imageError && coverImageUrl ? coverImageUrl : placeholderSrc;

  const eventDate = dateISO ? new Date(dateISO) : null;
  const deadlineDate = registrationDeadlineISO ? new Date(registrationDeadlineISO) : null;
  const dateDisplay = eventDate ? eventDate.toLocaleString() : '';

  useEffect(() => {
    const tick = () => {
      const nowMs = Date.now();
      const evtMs = eventDate ? Math.max(0, eventDate.getTime() - nowMs) : 0;
      const dlMs = deadlineDate ? Math.max(0, deadlineDate.getTime() - nowMs) : 0;
      const toObj = (ms) => {
        const d = Math.floor(ms / (1000 * 60 * 60 * 24));
        const h = Math.floor((ms / (1000 * 60 * 60)) % 24);
        const m = Math.floor((ms / (1000 * 60)) % 60);
        const s = Math.floor((ms / 1000) % 60);
        return { d, h, m, s };
      };
      setCountdown(toObj(evtMs));
      setDeadlineCountdown(toObj(dlMs));
    };
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, [dateISO, registrationDeadlineISO]);

  const handleRegisterClick = async (e) => {
    e.preventDefault();
    if (isRegistered) return;
    if (registering) return; // prevent double-click
    setRegistering(true);
    try {
      await onRegister(eventId);
    } finally {
      // Always re-enable button whether success or failure
      setRegistering(false);
    }
  };

  return (
    <Link
      to={`/events/${eventId}`}
      className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-shadow duration-300 ease-in-out flex flex-col group h-full"
    >
      <div className="relative">
        <img
          src={imageSrc}
          onError={() => setImageError(true)}
          alt={title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-0 transition-all duration-300"></div>
        <div className="absolute top-3 left-3 flex gap-2">
          {type && (
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-white/90 text-gray-800 shadow">
              {type === 'online' ? 'Online' : 'In-person'}
            </span>
          )}
          {category && (
            <span className="px-3 py-1 text-xs font-semibold rounded-full bg-indigo-600 text-white shadow">
              {category}
            </span>
          )}
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow">
        <p className="text-sm text-gray-500 mb-2 font-medium">
          Organized by: <span className="font-bold text-indigo-600">{organizerName}</span>
        </p>
        <h3 className="text-2xl font-bold font-heading mb-2 text-gray-800 line-clamp-2">{title}</h3>
        {shortDescription && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{shortDescription}</p>
        )}
        <div className="text-gray-600 space-y-2 mb-4 text-sm">
          <p><strong>Date:</strong> {dateDisplay}</p>
          <p><strong>Location:</strong> {location}</p>
          {capacity != null && (
            <p>
              <strong>Spots:</strong> {attendeesCount != null ? `${attendeesCount}/${capacity}` : capacity}
            </p>
          )}
          {eventDate && (
            <p className="text-indigo-700 font-semibold">
              Starts in: {countdown.d}d:{String(countdown.h).padStart(2,'0')}h:{String(countdown.m).padStart(2,'0')}m:{String(countdown.s).padStart(2,'0')}s
            </p>
          )}
          {deadlineDate && (
            <p className="text-gray-700">
              Reg closes in: {deadlineCountdown.d}d:{String(deadlineCountdown.h).padStart(2,'0')}h:{String(deadlineCountdown.m).padStart(2,'0')}m:{String(deadlineCountdown.s).padStart(2,'0')}s
            </p>
          )}
        </div>

        <div className="mt-auto">
          {isAuthenticated && (
            isRegistered ? (
              <div className="w-full font-bold py-2 px-4 rounded-lg bg-emerald-100 text-emerald-700 text-center cursor-default flex items-center justify-center gap-2">
                <span>✓</span>
                <span>Registered</span>
              </div>
            ) : (
              <button
                onClick={handleRegisterClick}
                disabled={registering}
                className={`w-full font-bold py-2 px-4 rounded-lg transition-all duration-200 transform ${
                  registering
                    ? 'bg-gray-400 text-white cursor-not-allowed'
                    : 'bg-emerald-500 text-white hover:bg-emerald-600 hover:scale-105'
                }`}
              >
                {registering ? 'Registering...' : 'Register'}
              </button>
            )
          )}
        </div>
      </div>
  </Link>
  );
};

export default EventCard;
