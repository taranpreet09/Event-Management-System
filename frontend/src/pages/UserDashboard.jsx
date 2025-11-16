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
        setError('Failed to fetch your events. Please try again later.');
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
        toast.error('Failed to unregister. Please try again.');
        console.error(err);
      }
    }
  };

  if (loading) return <div className="text-center mt-8">Loading your registered events...</div>;
  if (error) return <div className="text-center mt-8 text-red-500">{error}</div>;

  const totalEvents = registeredEvents.length;
  const upcomingSorted = [...registeredEvents].sort(
    (a, b) => new Date(a.date) - new Date(b.date)
  );
  const nextEvent = upcomingSorted[0];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Overview section */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome, {user?.name || 'User'}</h1>
        <p className="text-gray-600 mb-6">
          Here’s a quick overview of your upcoming events and registrations.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
            <p className="text-sm text-gray-500">Total registered events</p>
            <p className="text-3xl font-bold mt-1">{totalEvents}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 border border-gray-100">
            <p className="text-sm text-gray-500">Next event</p>
            {nextEvent ? (
              <div className="mt-1">
                <p className="font-semibold text-gray-800">{nextEvent.title}</p>
                <p className="text-sm text-gray-600">
                  {new Date(nextEvent.date).toLocaleString()}
                </p>
              </div>
            ) : (
              <p className="mt-1 text-sm text-gray-500">No upcoming events.</p>
            )}
          </div>
          <div className="bg-white rounded-lg shadow p-4 border border-gray-100 flex flex-col justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Inbox</p>
              <p className="text-sm text-gray-600">
                Check messages from organizers about your events.
              </p>
			</div>
			<div className="mt-3">
				<Link
					to="/dashboard/inbox"
					className="inline-block text-indigo-600 hover:text-indigo-800 font-semibold text-sm"
				>
					Go to Inbox →
				</Link>
			</div>
		</div>
        </div>
      </div>

      {/* Registered events list */}
      <div>
        <h2 className="text-2xl font-bold mb-4">My Registered Events</h2>
        {registeredEvents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {registeredEvents.map(event => (
            <div key={event._id} className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500 flex flex-col justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                <p className="text-gray-600 mb-1">Date: {new Date(event.date).toLocaleDateString()}</p>
                <p className="text-gray-600">Location: {event.location}</p>
              </div>
              <div className="mt-4">
                <button 
                  onClick={() => handleUnregister(event._id)}
                  className="w-full bg-red-500 text-white font-semibold py-2 px-4 rounded hover:bg-red-600 transition-colors"
                >
                  Unregister
                </button>
              </div>
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
    </div>
  );
};

export default UserDashboard;