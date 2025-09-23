import React, { useState, useEffect, useCallback } from 'react';
import EventCard from '../components/EventCard';
import { getAllEvents } from '../api/events';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

// Register API call
const registerForEventAPI = (eventId) => {
  const token = localStorage.getItem('token');
  return axios.put(
    `http://localhost:1111/api/events/register/${eventId}`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- NEW STATE for search and filter ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('upcoming'); // Default to show upcoming events

  // --- Animation variants ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  // Fetch events
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm,
        filter: filter === 'all' ? '' : filter,
      };
      const response = await getAllEvents(params);
      setEvents(response.data);
    } catch (err) {
      setError('Could not fetch events.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, filter]);

  // Debounced effect
  useEffect(() => {
    const timerId = setTimeout(() => {
      fetchEvents();
    }, 500);
    return () => clearTimeout(timerId);
  }, [fetchEvents]);

  const handleRegister = async (eventId) => {
    try {
      const res = await registerForEventAPI(eventId);
      toast.success(res.data.msg);
    } catch (err) {
      const errorMsg =
        err.response?.data?.msg || 'Failed to register for event.';
      toast.error(errorMsg);
      console.error(err);
    }
  };

  return (
    <div>
      {/* --- Search & Filter UI --- */}
      <div className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h1 className="text-3xl font-bold mb-4">Find Your Next Event</h1>
        <div className="flex flex-col md:flex-row gap-4">
          <input
            type="text"
            placeholder="Search by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/2 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={
                filter === 'all'
                  ? 'bg-indigo-600 text-white px-4 py-2 rounded-lg'
                  : 'bg-white text-gray-700 px-4 py-2 rounded-lg border'
              }
            >
              All
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={
                filter === 'upcoming'
                  ? 'bg-indigo-600 text-white px-4 py-2 rounded-lg'
                  : 'bg-white text-gray-700 px-4 py-2 rounded-lg border'
              }
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilter('past')}
              className={
                filter === 'past'
                  ? 'bg-indigo-600 text-white px-4 py-2 rounded-lg'
                  : 'bg-white text-gray-700 px-4 py-2 rounded-lg border'
              }
            >
              Past
            </button>
          </div>
        </div>
      </div>

      {/* --- Event List --- */}
      {loading ? (
        <div className="text-center">Loading events...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : events.length > 0 ? (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {events.map((event) => (
            <motion.div key={event._id} variants={itemVariants}>
              <EventCard
                eventId={event._id}
                title={event.title}
                date={new Date(event.date).toLocaleString()}
                location={event.location}
                organizerName={event.organizer.name}
                onRegister={handleRegister}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="text-center text-gray-500 mt-10">
          <h2 className="text-2xl font-semibold">No Events Found</h2>
          <p>Try adjusting your search or filter criteria.</p>
        </div>
      )}
    </div>
  );
};

export default EventList;
