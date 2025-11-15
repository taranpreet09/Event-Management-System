import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'; 
import Modal from '../components/Modal'; 

// Corrected import path (now confirmed to be 'auth.js')
import api from '../utils/auth.js'; 

// Helper functions using the imported api
const getMyEvents = () => api.get('/events/my-events');
const deleteEvent = (id) => api.delete(`/events/${id}`);
const getEventAttendees = (id) => api.get(`/events/${id}/attendees`);


const OrganizerDashboard = () => {
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [attendeesModal, setAttendeesModal] = useState({
    isOpen: false,
    attendees: [],
    eventName: '',
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

  const closeModal = () => {
    setAttendeesModal({ isOpen: false, attendees: [], eventName: '' });
  };

  if (loading) return <div className="text-center mt-8">Loading your events...</div>;
  if (error) return <div className="text-center mt-8 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Organizer Dashboard</h1>
        <Link to="/create-event" className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700">
          + Create New Event
        </Link>
      </div>

      {/* --- ADMIN TOOLS SECTION --- */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg shadow-sm border border-gray-200">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">Admin Tools</h2>
        <Link 
          to="/broadcast"
          className="inline-block bg-green-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-600 transition-all shadow-md hover:shadow-lg"
        >
          Send New Broadcast
        </Link>
      </div>

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
                <p className="text-gray-800 bg-gray-100 p-2 rounded">
                  Attendees: <strong>{event.attendees.length}</strong>
                </p>
              </div>
              <div className="flex justify-end items-center space-x-2 mt-4">
                <button onClick={() => handleViewAttendees(event._id, event.title)} className="bg-blue-500 text-white font-semibold py-1 px-3 rounded hover:bg-blue-600 text-sm">
                  View Attendees
                </button>
                <button onClick={() => navigate(`/edit-event/${event._id}`)} className="bg-gray-200 text-gray-800 font-semibold py-1 px-3 rounded hover:bg-gray-300 text-sm">
                  Edit
                </button>
                <button onClick={() => handleDelete(event._id)} className="bg-red-500 text-white font-semibold py-1 px-3 rounded hover:bg-red-600 text-sm">
                  Delete
                </button>
            </div>
          </div>
        ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p>You haven't created any events yet.</p>
        </div>
      )}

    {attendeesModal.isOpen && (
      <Modal onClose={closeModal}>
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
  </div>
  );
};

export default OrganizerDashboard;