import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { getRegisteredEvents, unregisterFromEvent } from '../api/events'; 
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const UserDashboard = () => {
  const { user } = useAuth();
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRegisteredEvents = async () => {
      try {
        const response = await getRegisteredEvents();
        setRegisteredEvents(response.data);
      } catch (err) {
        setError('Failed to fetch your events.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRegisteredEvents();
  }, []);

  const handleUnregister = async (eventId) => {
    if (window.confirm('Are you sure you want to unregister from this event?')) {
      try {
        await unregisterFromEvent(eventId);
        setRegisteredEvents(prevEvents => 
          prevEvents.filter(event => event._id !== eventId)
        );
        toast.success('Successfully unregistered!');
      } catch (err) {
        toast.error('Failed to unregister.');
      }
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <span className="material-symbols-outlined text-3xl animate-spin text-primary">progress_activity</span>
    </div>
  );
  if (error) return <div className="text-center mt-8 text-error">{error}</div>;

  const totalEvents = registeredEvents.length;
  const upcomingSorted = [...registeredEvents].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );
  const nextEvent = upcomingSorted[0];

  return (
    <div className="w-full">
      {/* Greeting & Stats */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-20">
        <div className="lg:col-span-7 bg-surface-container-low rounded-xl p-8 md:p-10 flex flex-col justify-between relative overflow-hidden group">
          <div className="relative z-10">
            <span className="font-label text-[10px] uppercase tracking-[0.2em] font-extrabold text-on-tertiary-fixed-variant mb-5 block">Member Access</span>
            <h2 className="font-headline text-3xl md:text-4xl font-bold text-primary mb-2">Welcome, {user?.name || 'User'}</h2>
            <p className="text-on-surface-variant opacity-80 font-headline italic text-base">Your curated experiences await.</p>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-4 z-10">
            <Link to="/events" className="silk-gradient text-on-primary px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg hover:opacity-90 transition-all">
              <span className="font-label text-[10px] uppercase tracking-widest font-bold">Discover Events</span>
              <span className="material-symbols-outlined text-sm">explore</span>
            </Link>
            <Link to="/dashboard/inbox" className="bg-surface-container-high text-on-surface px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-surface-container-highest transition-all">
              <span className="font-label text-[10px] uppercase tracking-widest font-bold">Inbox</span>
              <span className="material-symbols-outlined text-sm">mail</span>
            </Link>
          </div>
          <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>
        </div>

        <div className="lg:col-span-5 grid grid-cols-2 gap-6">
          <div className="bg-surface-container-lowest rounded-xl p-6 flex flex-col items-center justify-center text-center border border-outline-variant/10">
            <span className="material-symbols-outlined text-tertiary-fixed-dim text-3xl mb-3" style={{ fontVariationSettings: "'FILL' 1" }}>confirmation_number</span>
            <div className="text-4xl font-bold text-primary mb-1 font-headline">{totalEvents}</div>
            <span className="font-label text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Registrations</span>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-6 flex flex-col items-center justify-center text-center border border-outline-variant/10">
            <span className="material-symbols-outlined text-tertiary-fixed-dim text-3xl mb-3" style={{ fontVariationSettings: "'FILL' 1" }}>event_upcoming</span>
            {nextEvent ? (
              <div className="text-center">
                <p className="font-bold text-primary text-sm font-headline truncate max-w-[120px]" title={nextEvent.title}>{nextEvent.title}</p>
                <p className="text-[9px] font-label uppercase tracking-widest text-outline mt-1">
                  {new Date(nextEvent.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </p>
              </div>
            ) : (
              <p className="text-xs text-on-surface-variant font-light italic">No upcoming</p>
            )}
            <span className="font-label text-[10px] uppercase tracking-widest font-bold text-on-surface-variant mt-2">Next Event</span>
          </div>
        </div>
      </section>

      {/* Registered Events */}
      <section>
        <div className="flex items-center justify-between mb-10">
          <h2 className="font-headline text-2xl font-bold text-primary tracking-tight">Your Registrations</h2>
          <div className="h-px flex-grow mx-6 bg-surface-container-high"></div>
        </div>

        {registeredEvents.length > 0 ? (
          <div className="space-y-6">
            {registeredEvents.map(event => (
              <div key={event._id} className="grid grid-cols-1 lg:grid-cols-12 bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10 group hover:shadow-lg transition-all">
                {/* Image */}
                <div className="lg:col-span-3 h-full min-h-[200px] overflow-hidden relative bg-surface-container-low">
                  <img 
                    alt={event.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 absolute inset-0"
                    src={event.coverImageUrl || '/placeholder-event.jpg'}
                  />
                </div>
                {/* Content */}
                <div className="lg:col-span-9 p-6 md:p-8 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-4 mb-3 text-sm">
                      <div className="flex flex-col">
                        <span className="font-label text-[10px] uppercase tracking-widest font-extrabold text-on-surface-variant">Date</span>
                        <span className="text-primary font-medium">{new Date(event.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div className="w-px h-6 bg-outline-variant/30 mx-1"></div>
                      <div className="flex flex-col">
                        <span className="font-label text-[10px] uppercase tracking-widest font-extrabold text-on-surface-variant">Location</span>
                        <span className="text-primary font-medium truncate max-w-[200px]">{event.location}</span>
                      </div>
                    </div>
                    <h3 className="font-headline text-2xl font-bold text-primary mb-4 line-clamp-2">{event.title}</h3>
                  </div>
                  <div className="flex items-center justify-between border-t border-surface-container-high pt-4">
                    <Link to={`/events/${event._id}`} className="font-label text-[10px] uppercase tracking-widest font-bold text-primary hover:opacity-70 flex items-center gap-2">
                      View Details <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                    <button 
                      onClick={() => handleUnregister(event._id)}
                      className="flex items-center gap-2 py-2 px-4 bg-surface-container-low text-error hover:bg-error hover:text-white rounded-lg transition-all font-label text-[10px] font-bold uppercase tracking-widest"
                    >
                      <span className="material-symbols-outlined text-xs">cancel</span>
                      Unregister
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-surface-container-low rounded-xl border border-outline-variant/10 flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-outline/30 font-light">confirmation_number</span>
            <p className="font-light text-on-surface-variant text-sm">Your itinerary is currently empty.</p>
            <Link to="/events" className="mt-3 silk-gradient text-white px-8 py-3 rounded-lg font-label text-[10px] font-extrabold uppercase tracking-[0.2em] shadow-lg hover:scale-105 transition-all text-center">
              Discover Experiences
            </Link>
          </div>
        )}
      </section>
    </div>
  );
};

export default UserDashboard;