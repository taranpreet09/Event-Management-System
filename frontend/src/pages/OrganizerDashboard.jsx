import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; 
import Modal from '../components/Modal'; 
import api from '../utils/auth.js'; 
import { broadcastInboxMessage } from '../api/messages';
import { useAuth } from '../context/AuthContext';

const getMyEvents = () => api.get('/events/my-events');
const deleteEvent = (id) => api.delete(`/events/${id}`);
const getEventAttendees = (id) => api.get(`/events/${id}/attendees`);

const OrganizerDashboard = () => {
  const { user } = useAuth();
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [attendeesModal, setAttendeesModal] = useState({ isOpen: false, attendees: [], eventName: '' });
  const [messageModal, setMessageModal] = useState({ isOpen: false, eventId: null, eventName: '', text: '' });

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      const response = await getMyEvents();
      const eventsData = response.data?.events || response.data || [];
      setMyEvents(Array.isArray(eventsData) ? eventsData : []);
    } catch (err) {
      setError('Failed to fetch your events.');
      setMyEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyEvents();
    const intervalId = setInterval(fetchMyEvents, 10000);
    return () => clearInterval(intervalId);
  }, []);

  const handleDelete = async (eventId) => {
    if (window.confirm('Are you sure you want to withdraw this event?')) {
      try {
        await deleteEvent(eventId);
        toast.success('Event withdrawn!');
        fetchMyEvents();
      } catch (err) { toast.error('Failed to delete event.'); }
    }
  };

  const handleViewAttendees = async (eventId, eventName) => {
    try {
      const response = await getEventAttendees(eventId);
      setAttendeesModal({ isOpen: true, attendees: response.data, eventName });
    } catch (err) { toast.error('Failed to fetch attendees'); }
  };

  const openMessageModal = (eventId, eventName) => {
    setMessageModal({ isOpen: true, eventId, eventName, text: '' });
  };
  const closeAttendeesModal = () => setAttendeesModal({ isOpen: false, attendees: [], eventName: '' });
  const closeMessageModal = () => setMessageModal({ isOpen: false, eventId: null, eventName: '', text: '' });

  const handleSendInboxMessage = async (e) => {
    e.preventDefault();
    if (!messageModal.text.trim()) return toast.error('Message text is required');
    try {
      await broadcastInboxMessage(messageModal.eventId, messageModal.text.trim());
      toast.success('Message sent to all attendees');
      closeMessageModal();
    } catch (err) { toast.error('Failed to send message'); }
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <span className="material-symbols-outlined text-3xl animate-spin text-primary">progress_activity</span>
    </div>
  );
  if (error) return <div className="text-center mt-8 text-error">{error}</div>;

  const totalEvents = myEvents?.length || 0;
  const totalAttendees = myEvents?.reduce((acc, event) => acc + (event.attendees?.length || 0), 0) || 0;

  return (
    <div className="w-full">
      {/* Greeting & Stats Grid */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-20">
        {/* Greeting Card */}
        <div className="lg:col-span-7 bg-surface-container-low rounded-xl p-8 md:p-10 flex flex-col justify-between relative overflow-hidden group">
          <div className="relative z-10">
            <span className="font-label text-[10px] uppercase tracking-[0.2em] font-extrabold text-on-tertiary-fixed-variant mb-5 block">Curator Access</span>
            <h2 className="font-headline text-3xl md:text-4xl font-bold text-primary mb-2">Welcome, {user?.name || 'Organizer'}</h2>
            <p className="text-on-surface-variant opacity-80 font-headline italic text-base">Your editorial journey continues here.</p>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-4 z-10">
            <Link to="/dashboard/events/create" className="silk-gradient text-on-primary px-6 py-3 rounded-lg flex items-center gap-2 shadow-lg hover:opacity-90 transition-all group/btn">
              <span className="font-label text-[10px] uppercase tracking-widest font-bold">New Experience</span>
              <span className="material-symbols-outlined text-sm">add</span>
            </Link>
            <Link to="/dashboard/broadcast" className="bg-surface-container-high text-on-surface px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-surface-container-highest transition-all">
              <span className="font-label text-[10px] uppercase tracking-widest font-bold">Broadcast</span>
              <span className="material-symbols-outlined text-sm">campaign</span>
            </Link>
          </div>
          <div className="absolute -right-16 -bottom-16 w-64 h-64 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors"></div>
        </div>

        {/* Stats Grid */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-6">
          <div className="bg-surface-container-lowest rounded-xl p-6 flex flex-col items-center justify-center text-center border border-outline-variant/10">
            <span className="material-symbols-outlined text-tertiary-fixed-dim text-3xl mb-3" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            <div className="text-4xl font-bold text-primary mb-1 font-headline">{totalEvents}</div>
            <span className="font-label text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Curated Events</span>
          </div>
          <div className="bg-surface-container-lowest rounded-xl p-6 flex flex-col items-center justify-center text-center border border-outline-variant/10">
            <span className="material-symbols-outlined text-tertiary-fixed-dim text-3xl mb-3" style={{ fontVariationSettings: "'FILL' 1" }}>group</span>
            <div className="text-4xl font-bold text-primary mb-1 font-headline">{totalAttendees}</div>
            <span className="font-label text-[10px] uppercase tracking-widest font-bold text-on-surface-variant">Total Guests</span>
          </div>
        </div>
      </section>

      {/* Event Portfolio Section */}
      <section>
        <div className="flex items-center justify-between mb-10">
          <h2 className="font-headline text-2xl font-bold text-primary tracking-tight">Your Portfolio</h2>
          <div className="h-px flex-grow mx-6 bg-surface-container-high"></div>
          <Link to="/dashboard/inbox" className="font-label text-[10px] uppercase tracking-widest font-bold text-primary hover:opacity-70 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">mail</span> Inbox
          </Link>
        </div>

        {Array.isArray(myEvents) && myEvents.length > 0 ? (
          <div className="space-y-8">
            {myEvents.map(event => (
              <div key={event._id} className="grid grid-cols-1 lg:grid-cols-12 bg-surface-container-lowest rounded-xl overflow-hidden border border-outline-variant/10 group hover:shadow-lg transition-all">
                {/* Image Side */}
                <div className="lg:col-span-4 h-full min-h-[250px] overflow-hidden relative bg-surface-container-low">
                  <img 
                    alt={event.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 absolute inset-0"
                    src={event.coverImageUrl || '/placeholder-event.jpg'}
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-tertiary-fixed-dim text-on-tertiary-fixed-variant px-3 py-1 rounded text-[10px] font-bold uppercase tracking-widest backdrop-blur-md">Active</span>
                  </div>
                </div>

                {/* Content Side */}
                <div className="lg:col-span-8 p-6 md:p-10 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-4 mb-4 text-sm">
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
                    <h3 className="font-headline text-3xl font-bold text-primary mb-3 lowercase line-clamp-2">{event.title}</h3>
                    <div className="flex items-center gap-2 mb-6">
                      <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                      <span className="text-on-surface-variant text-sm">{event.attendees?.length || 0} Confirmed Guest{(event.attendees?.length || 0) !== 1 ? 's' : ''}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 border-t border-surface-container-high pt-6">
                    <button onClick={() => handleViewAttendees(event._id, event.title)} className="flex flex-col items-center gap-1.5 group/btn">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-low group-hover/btn:bg-primary-container transition-all">
                        <span className="material-symbols-outlined text-lg text-primary group-hover/btn:text-white">visibility</span>
                      </div>
                      <span className="font-label text-[9px] uppercase tracking-widest font-bold opacity-60">View Guests</span>
                    </button>
                    <button onClick={() => openMessageModal(event._id, event.title)} className="flex flex-col items-center gap-1.5 group/btn">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-low group-hover/btn:bg-primary-container transition-all">
                        <span className="material-symbols-outlined text-lg text-primary group-hover/btn:text-white">edit_calendar</span>
                      </div>
                      <span className="font-label text-[9px] uppercase tracking-widest font-bold opacity-60">Update Guests</span>
                    </button>
                    <button onClick={() => navigate(`/dashboard/events/${event._id}/edit`)} className="flex flex-col items-center gap-1.5 group/btn">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-low group-hover/btn:bg-primary-container transition-all">
                        <span className="material-symbols-outlined text-lg text-primary group-hover/btn:text-white">edit_note</span>
                      </div>
                      <span className="font-label text-[9px] uppercase tracking-widest font-bold opacity-60">Edit Event</span>
                    </button>
                    <button onClick={() => handleDelete(event._id)} className="flex flex-col items-center gap-1.5 group/btn">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center bg-surface-container-low group-hover/btn:bg-error-container transition-all">
                        <span className="material-symbols-outlined text-lg text-error">close</span>
                      </div>
                      <span className="font-label text-[9px] uppercase tracking-widest font-bold opacity-60">Withdraw</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-surface-container-low rounded-xl border border-outline-variant/10 flex flex-col items-center gap-3">
            <span className="material-symbols-outlined text-4xl text-outline/30 font-light">museum</span>
            <p className="font-light text-on-surface-variant text-sm">Your portfolio is currently empty.</p>
            <Link to="/dashboard/events/create" className="mt-3 silk-gradient text-on-primary px-8 py-3 rounded-lg font-label text-[10px] font-extrabold uppercase tracking-[0.2em] shadow-lg hover:scale-105 transition-all text-center">
              Create First Experience
            </Link>
          </div>
        )}
      </section>

      {/* Attendees Modal */}
      {attendeesModal.isOpen && (
        <Modal onClose={closeAttendeesModal}>
          <h2 className="font-headline text-xl font-bold mb-5 text-primary tracking-tight">Guest List: <span className="font-light italic">"{attendeesModal.eventName}"</span></h2>
          {attendeesModal.attendees.length > 0 ? (
            <ul className="space-y-2.5 max-h-[60vh] overflow-y-auto pr-2">
              {attendeesModal.attendees.map(attendee => (
                <li key={attendee._id} className="bg-surface p-3 rounded border border-outline-variant/20 flex justify-between items-center hover:border-primary/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary-fixed text-primary flex items-center justify-center font-bold text-xs">
                       {attendee.user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-medium text-on-surface font-headline text-sm">{attendee.user.name}</span>
                  </div>
                  <span className="text-xs font-light text-on-surface-variant bg-surface-container px-2 py-1 rounded">{attendee.user.email}</span>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-10 flex flex-col items-center opacity-70">
              <span className="material-symbols-outlined text-3xl mb-3">person_off</span>
              <p className="text-on-surface-variant font-light text-sm">No one has registered yet.</p>
            </div>
          )}
        </Modal>
      )}

      {/* Message Modal */}
      {messageModal.isOpen && (
        <Modal onClose={closeMessageModal}>
          <div className="mb-5 border-b border-outline-variant/20 pb-3">
            <h2 className="font-headline text-xl font-bold text-primary tracking-tight">Message Guests</h2>
            <p className="text-xs text-on-surface-variant font-light mt-1">For <span className="font-semibold">"{messageModal.eventName}"</span></p>
          </div>
          <form onSubmit={handleSendInboxMessage} className="space-y-5">
            <div>
              <label className="font-label text-[10px] uppercase tracking-[0.2em] text-on-surface-variant font-bold mb-2 block">Communication details</label>
              <textarea
                className="w-full bg-surface-container-low border border-outline-variant/30 rounded-lg p-4 focus:outline-none focus:ring-0 focus:border-primary transition-all font-light text-on-surface placeholder:text-outline-variant/50 min-h-[100px] text-sm"
                placeholder="Write an itinerary update, reminder, or general message..."
                value={messageModal.text}
                onChange={(e) => setMessageModal((prev) => ({ ...prev, text: e.target.value }))}
              />
            </div>
            <div className="flex justify-end space-x-3 pt-2">
              <button type="button" onClick={closeMessageModal} className="px-5 py-2.5 font-label text-[10px] font-bold uppercase tracking-widest text-on-surface-variant hover:text-error transition-colors">Cancel</button>
              <button type="submit" className="silk-gradient text-on-primary px-6 py-2.5 rounded-lg font-label text-[10px] font-extrabold uppercase tracking-widest shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
                Dispatch <span className="material-symbols-outlined text-sm">send</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default OrganizerDashboard;