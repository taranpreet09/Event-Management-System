import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMyEvents, deleteEvent, getEventAttendees } from '../api/events'; // <-- Import getEventAttendees
import Modal from '../components/Modal'; // <-- Import the Modal component

const OrganizerDashboard = () => {
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // --- NEW STATE FOR THE MODAL ---
  const [attendeesModal, setAttendeesModal] = useState({
    isOpen: false,
    attendees: [],
    eventName: '',
  });

  const fetchMyEvents = async () => {
    // ... (this function remains the same)
    try {
      setLoading(true);
      const response = await getMyEvents();
      setMyEvents(response.data);
    } catch (err) {
      setError('Failed to fetch your events. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyEvents();
  }, []);

  const handleDelete = async (eventId) => {
    // ... (this function remains the same)
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteEvent(eventId);
        fetchMyEvents();
      } catch (err) {
        toast.error('Failed to delete event.');
      }
    }
  };

  // --- NEW HANDLER FOR VIEWING ATTENDEES ---
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
      {/* ... (header and create event button remain the same) */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Organizer Dashboard</h1>
        <Link to="/create-event" className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700">
          + Create New Event
        </Link>
      </div>

      <h2 className="text-2xl font-semibold mb-4">My Events</h2>
      {myEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myEvents.map(event => (
            <div key={event._id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500 flex flex-col justify-between">
              {/* Event details */}
              <div>
                <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                <p className="text-gray-600 mb-1">Date: {new Date(event.date).toLocaleDateString()}</p>
                <p className="text-gray-600 mb-4">Location: {event.location}</p>
                <p className="text-gray-800 bg-gray-100 p-2 rounded">
                  Attendees: <strong>{event.attendees.length}</strong>
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end items-center space-x-2 mt-4">
                {/* --- NEW BUTTON --- */}
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

      {/* --- NEW MODAL RENDER --- */}
      {attendeesModal.isOpen && (
        <Modal onClose={closeModal}>
          <h2 className="text-2xl font-bold mb-4">Attendees for "{attendeesModal.eventName}"</h2>
          {attendeesModal.attendees.length > 0 ? (
            <ul className="space-y-3 max-h-80 overflow-y-auto">
              {attendeesModal.attendees.map(attendee => (
                <li key={attendee._id} className="bg-gray-100 p-3 rounded-md flex justify-between items-center">
                  <span className="font-medium text-gray-800">{attendee.name}</span>
                  <span className="text-sm text-gray-500">{attendee.email}</span>
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