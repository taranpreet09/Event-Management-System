import React, { useState, useEffect, useCallback } from 'react';
import EventCard from '../components/EventCard';
import { getAllEvents } from '../api/events';
import axios from 'axios';

// The register function can stay here or be moved to api/events.js
const registerForEventAPI = (eventId) => {
    const token = localStorage.getItem('token');
    return axios.put(`http://localhost:1111/api/events/register/${eventId}`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
};

const EventList = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- NEW STATE for search and filter ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('upcoming'); // Default to show upcoming events

  // Function to fetch events based on current state
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        search: searchTerm,
        filter: filter === 'all' ? '' : filter, // Don't send 'all' to backend
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


  // useEffect to fetch events when filter changes, or after user stops typing
  useEffect(() => {
    // Debounce search input: wait 500ms after user stops typing
    const timerId = setTimeout(() => {
      fetchEvents();
    }, 500);

    return () => {
      clearTimeout(timerId); // Cleanup timer on re-render
    };
  }, [fetchEvents]); // fetchEvents is wrapped in useCallback

  const handleRegister = async (eventId) => {
    // ... (this function remains the same)
    try {
      const res = await registerForEventAPI(eventId);
      alert(res.data.msg);
    } catch (err) {
      alert(err.response?.data?.msg || "Registration failed.");
    }
  };

  return (
    <div>
      <div className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h1 className="text-3xl font-bold mb-4">Find Your Next Event</h1>
        <div className="flex flex-col md:flex-row gap-4">
          {/* --- SEARCH INPUT --- */}
          <input
            type="text"
            placeholder="Search by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/2 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {/* --- FILTER BUTTONS --- */}
          <div className="flex items-center space-x-2">
            <button onClick={() => setFilter('all')} className={filter === 'all' ? 'bg-indigo-600 text-white px-4 py-2 rounded-lg' : 'bg-white text-gray-700 px-4 py-2 rounded-lg border'}>All</button>
            <button onClick={() => setFilter('upcoming')} className={filter === 'upcoming' ? 'bg-indigo-600 text-white px-4 py-2 rounded-lg' : 'bg-white text-gray-700 px-4 py-2 rounded-lg border'}>Upcoming</button>
            <button onClick={() => setFilter('past')} className={filter === 'past' ? 'bg-indigo-600 text-white px-4 py-2 rounded-lg' : 'bg-white text-gray-700 px-4 py-2 rounded-lg border'}>Past</button>
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="text-center">Loading events...</div>
      ) : error ? (
        <div className="text-center text-red-500">{error}</div>
      ) : events.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {events.map(event => (
            <EventCard
              key={event._id}
              eventId={event._id}
              title={event.title}
              date={new Date(event.date).toLocaleString()}
              location={event.location}
              organizerName={event.organizer.name}
              onRegister={handleRegister}
            />
          ))}
        </div>
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