import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; 
import Modal from '../components/Modal'; 

// Corrected import path (now confirmed to be 'auth.js')
import api from '../utils/auth.js'; 
import { broadcastInboxMessage } from '../api/messages';
import { useAuth } from '../context/AuthContext';

// Helper functions using the imported api
const getMyEvents = () => api.get('/events/my-events');
const deleteEvent = (id) => api.delete(`/events/${id}`);
const getEventAttendees = (id) => api.get(`/events/${id}/attendees`);


const OrganizerDashboard = () => {
  const { user } = useAuth();
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [attendeesModal, setAttendeesModal] = useState({
    isOpen: false,
    attendees: [],
    eventName: '',
  });

  const [messageModal, setMessageModal] = useState({
    isOpen: false,
    eventId: null,
    eventName: '',
    text: '',
  });

  const fetchMyEvents = async () => {
    try {
      setLoading(true);
      const response = await getMyEvents();

      // ⭐ FIX: Safely extract the events array from the response data.
      // It checks for response.data as an array OR response.data.events as an array.
      // It defaults to an empty array [] to prevent the .map() crash.
      const eventsData = response.data?.events || response.data || [];
      
      setMyEvents(Array.isArray(eventsData) ? eventsData : []);

    } catch (err) {
      setError('Failed to fetch your events. Please try again later.');
      console.error(err);
      setMyEvents([]); // Critical: Ensure state is an empty array on failure
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchMyEvents();
  }, []);

  const handleDelete = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteEvent(eventId);
        toast.success('Event deleted!');
        fetchMyEvents();
      } catch (err) {
        toast.error('Failed to delete event.');
      }
    }
  };

  const handleViewAttendees = async (eventId, eventName) => {
    try {
      const response = await getEventAttendees(eventId);
      setAttendeesModal({
        isOpen: true,
        attendees: response.data,
        eventName: eventName,
      });
    } catch (err) {
      toast.error('Failed to fetch attendees');
      console.error(err);
    }
  };

  const openMessageModal = (eventId, eventName) => {
    setMessageModal({ isOpen: true, eventId, eventName, text: '' });
  };

  const closeAttendeesModal = () => {
    setAttendeesModal({ isOpen: false, attendees: [], eventName: '' });
  };

  const closeMessageModal = () => {
    setMessageModal({ isOpen: false, eventId: null, eventName: '', text: '' });
  };

  const handleSendInboxMessage = async (e) => {
    e.preventDefault();
    if (!messageModal.text.trim()) {
      toast.error('Message text is required');
      return;
    }
    try {
      await broadcastInboxMessage(messageModal.eventId, messageModal.text.trim());
      toast.success('Message sent to all attendees');
      closeMessageModal();
    } catch (err) {
      console.error(err);
      toast.error('Failed to send message');
    }
  };

  if (loading) return <div className="text-center mt-8">Loading your events...</div>;
  if (error) return <div className="text-center mt-8 text-red-500">{error}</div>;

  const totalEvents = myEvents.length;
  const totalAttendees = myEvents.reduce(
    (sum, event) => sum + (event.attendees?.length || 0),
    0
  );

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Overview header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            Organizer Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Welcome, {user?.name || 'Organizer'}. Manage your events, attendees, and messages.
          </p>
        </div>
		<div className="flex gap-3">
			<Link
				to="/dashboard/events/create"
				className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700"
			>
				+ Create New Event
			</Link>
			<Link
				to="/dashboard/broadcast"
				className="bg-green-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-600"
			>
				Send Broadcast
			</Link>
		</div>
      </div>

      {/* Overview cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Total events</p>
          <p className="text-3xl font-bold mt-1">{totalEvents}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
          <p className="text-sm text-gray-500">Total attendees</p>
          <p className="text-3xl font-bold mt-1">{totalAttendees}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4 border border-gray-100 flex flex-col justify-between">
          <div>
            <p className="text-sm text-gray-500 mb-1">Inbox</p>
            <p className="text-sm text-gray-600">
              Send and review messages sent to your attendees.
            </p>
          </div>
          <div className="mt-3">
            <Link
              to="/inbox"
              className="inline-block text-indigo-600 hover:text-indigo-800 font-semibold text-sm"
            >
              Go to Inbox →
            </Link>
          </div>
        </div>
      </div>

      {/* Events section */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">My Events</h2>
        
        {/* ⭐ FIX: Added Array.isArray check for extra safety */}
        {Array.isArray(myEvents) && myEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myEvents.map(event => (
					<div key={event._id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500 flex flex-col justify-between">
						<div>
							<h3 className="text-xl font-bold mb-2">{event.title}</h3>
							<p className="text-gray-600 mb-1">Date: {new Date(event.date).toLocaleDateString()}</p>
							<p className="text-gray-600 mb-4">Location: {event.location}</p>
							<p className="text-gray-800 bg-gray-100 p-2 rounded mb-3">
								Attendees: <strong>{event.attendees.length}</strong>
							</p>
						</div>
						<div className="flex flex-wrap justify-between items-center gap-2 mt-2">
							<div className="flex flex-wrap gap-2">
								<button onClick={() => handleViewAttendees(event._id, event.title)} className="inline-flex items-center justify-center border border-blue-500 text-blue-600 font-medium py-1 px-3 rounded-full hover:bg-blue-50 text-xs">
									View attendees
								</button>
								<button onClick={() => openMessageModal(event._id, event.title)} className="inline-flex items-center justify-center border border-green-500 text-green-600 font-medium py-1 px-3 rounded-full hover:bg-green-50 text-xs">
									Message attendees
								</button>
							</div>
							<div className="flex flex-wrap gap-2">
								<button onClick={() => navigate(`/dashboard/events/${event._id}/edit`)} className="inline-flex items-center justify-center bg-gray-100 text-gray-800 font-medium py-1 px-3 rounded-full hover:bg-gray-200 text-xs">
									Edit
								</button>
								<button onClick={() => handleDelete(event._id)} className="inline-flex items-center justify-center bg-red-500 text-white font-medium py-1 px-3 rounded-full hover:bg-red-600 text-xs">
									Delete
								</button>
							</div>
						</div>
					</div>
        ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p>You haven't created any events yet.</p>
        </div>
        )}
      </div>

    {attendeesModal.isOpen && (
      <Modal onClose={closeAttendeesModal}>
        <h2 className="text-2xl font-bold mb-4">Attendees for "{attendeesModal.eventName}"</h2>
        {attendeesModal.attendees.length > 0 ? (
          <ul className="space-y-3 max-h-80 overflow-y-auto">
            {attendeesModal.attendees.map(attendee => (
              <li key={attendee._id} className="bg-gray-100 p-3 rounded-md flex justify-between items-center">
                <span className="font-medium text-gray-800">{attendee.user.name}</span>
                <span className="text-sm text-gray-500">{attendee.user.email}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-600">No one has registered for this event yet.</p>
        )}
      </Modal>
    )}

    {messageModal.isOpen && (
      <Modal onClose={closeMessageModal}>
        <h2 className="text-2xl font-bold mb-4">Message attendees of "{messageModal.eventName}"</h2>
        <form onSubmit={handleSendInboxMessage} className="space-y-4">
          <textarea
            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={4}
            placeholder="Write a message (e.g., reminders, updates)..."
            value={messageModal.text}
            onChange={(e) => setMessageModal((prev) => ({ ...prev, text: e.target.value }))}
          />
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={closeMessageModal}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Send Message
            </button>
          </div>
        </form>
      </Modal>
    )}
  </div>
  );
};

export default OrganizerDashboard;