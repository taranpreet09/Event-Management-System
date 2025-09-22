import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyEvents } from '../api/events';

const OrganizerDashboard = () => {
  const [myEvents, setMyEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMyEvents = async () => {
      try {
        const response = await getMyEvents();
        setMyEvents(response.data);
      } catch (err) {
        setError('Failed to fetch your events. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyEvents();
  }, []);

  if (loading) return <div className="text-center mt-8">Loading your events...</div>;
  if (error) return <div className="text-center mt-8 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Organizer Dashboard</h1>
        <Link to="/create-event" className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors">
          + Create New Event
        </Link>
      </div>
      
      <h2 className="text-2xl font-semibold mb-4">My Events</h2>
      {myEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {myEvents.map(event => (
            <div key={event._id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500">
              <h3 className="text-xl font-bold mb-2">{event.title}</h3>
              <p className="text-gray-600 mb-1">Date: {new Date(event.date).toLocaleDateString()}</p>
              <p className="text-gray-600 mb-4">Location: {event.location}</p>
              <p className="text-gray-800 bg-gray-100 p-2 rounded">Attendees: {event.attendees.length}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-600">You haven't created any events yet.</p>
          <p className="text-gray-500 mt-2">Click the "Create New Event" button to get started!</p>
        </div>
      )}
    </div>
  );
};

export default OrganizerDashboard;