import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import { getRegisteredEvents } from '../api/events';


const UserDashboard = () => {
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRegisteredEvents = async () => {
      try {
        const response = await getRegisteredEvents();
        setRegisteredEvents(response.data);
      } catch (err) {
        setError('Failed to fetch your events. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchRegisteredEvents();
  }, []);

  if (loading) return <div className="text-center mt-8">Loading your registered events...</div>;
  if (error) return <div className="text-center mt-8 text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">My Registered Events</h1>
      {registeredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {registeredEvents.map(event => (
            <div key={event._id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
              <h3 className="text-xl font-bold mb-2">{event.title}</h3>
              <p className="text-gray-600 mb-1">Date: {new Date(event.date).toLocaleDateString()}</p>
              <p className="text-gray-600">Location: {event.location}</p>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 bg-gray-50 rounded-lg">
          <p className="text-gray-600">You haven't registered for any events yet.</p>
          <Link to="/events" className="text-indigo-600 hover:underline mt-2 inline-block">
            Browse upcoming events
          </Link>
        </div>
      )}
    </div>
  );
};

export default UserDashboard;