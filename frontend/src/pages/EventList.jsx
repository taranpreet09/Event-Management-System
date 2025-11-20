import React, { useState, useEffect, useCallback } from 'react';
import EventCard from '../components/EventCard';
import { getAllEvents, getRegisteredEvents } from '../api/events';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { useAuth } from '../context/AuthContext';

const registerForEventAPI = (eventId) => {
  const token = localStorage.getItem('token');
  return axios.put(
    `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/events/register/${eventId}`,
    {},
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

const EventList = () => {
  const { isAuthenticated, user } = useAuth();

  // --- State ---
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [filter, setFilter] = useState('upcoming');

  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [registeredEventIds, setRegisteredEventIds] = useState([]);

  // --- Debounce search ---
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  // --- Animation variants ---
  const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.1 } } };
  const itemVariants = { hidden: { y: 20, opacity: 0 }, visible: { y: 0, opacity: 1 } };

  // --- Fetch events by search/filter ---
  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = { search: debouncedSearchTerm, filter: filter === 'all' ? '' : filter };
      const response = await getAllEvents(params);
      setEvents(response.data);
    } catch (err) {
      setError('Could not fetch events.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [debouncedSearchTerm, filter]);

  // --- Fetch events by date (calendar) ---
  const fetchEventsByDate = useCallback(async () => {
    if (!selectedDate) return;
    try {
      setLoading(true);
      const formattedDate = `${selectedDate.getFullYear()}-${(selectedDate.getMonth() + 1)
        .toString()
        .padStart(2, '0')}-${selectedDate.getDate().toString().padStart(2, '0')}`;
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/events/by-date?date=${formattedDate}`);
      setEvents(response.data);
    } catch (err) {
      setError('Could not fetch events for this date.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  // --- Fetch registered events for logged-in user ---
  useEffect(() => {
    const fetchRegistered = async () => {
      if (!isAuthenticated || user?.role !== 'user') return;
      try {
        const res = await getRegisteredEvents();
        const ids = Array.isArray(res.data) ? res.data.map((e) => e._id) : [];
        setRegisteredEventIds(ids);
      } catch (err) {
        console.error('Could not fetch registered events', err);
      }
    };

    fetchRegistered();
  }, [isAuthenticated, user]);

  // --- Main effect ---
  useEffect(() => {
    if (selectedDate) fetchEventsByDate();
    else fetchEvents();
  }, [fetchEvents, fetchEventsByDate, selectedDate]);

  // --- Handlers ---
 const [registeringEvent, setRegisteringEvent] = useState(null);

const handleRegister = async (eventId) => {
  // prevent multiple clicks for same event
  if (registeringEvent === eventId) return;

  setRegisteringEvent(eventId);
  toast.info("Registering... please wait.", { autoClose: 1500 });

  try {
    const res = await registerForEventAPI(eventId);
    toast.success(res.data.msg || "Registered successfully!");
    setRegisteredEventIds((prev) =>
      prev.includes(eventId) ? prev : [...prev, eventId]
    );
  } catch (err) {
    toast.error(err.response?.data?.msg || "Failed to register.");
    console.error(err);
  } finally {
    setRegisteringEvent(null);
  }
};


  // --- UI ---
  return (
    <div className="relative">
      <div className="mb-8 p-6 bg-gray-50 rounded-lg">
        <h1 className="text-3xl font-bold mb-4">Find Your Next Event</h1>

        {/* Search + Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <input
            type="text"
            placeholder="Search by title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/2 p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex items-center space-x-2">
            {['all', 'upcoming', 'past'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg ${
                  filter === f ? 'bg-indigo-600 text-white' : 'bg-white border text-gray-700'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {selectedDate && (
          <p className="text-gray-600 mb-4">Showing events for: {selectedDate.toDateString()}</p>
        )}
      </div>

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
                shortDescription={event.shortDescription}
                category={event.category}
                type={event.type}
                dateISO={event.date}
                registrationDeadlineISO={event.registrationDeadline}
                location={event.location}
                capacity={event.capacity}
                attendeesCount={Array.isArray(event.attendees) ? event.attendees.filter((a) => a.isVerified).length : undefined}
                coverImageUrl={event.coverImageUrl}
                organizerName={event.organizer ? event.organizer.name : 'Unknown'}
                onRegister={handleRegister}
                isRegistered={registeredEventIds.includes(event._id)}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="text-center text-gray-500 mt-10">
          <h2 className="text-2xl font-semibold">No Events Found</h2>
          <p>Try adjusting your search, filter, or date.</p>
        </div>
      )}

      {/* Floating Calendar Button */}
      <button
        onClick={() => setCalendarOpen(true)}
        className="fixed bottom-6 right-6 bg-indigo-600 text-white px-5 py-3 rounded-full shadow-lg hover:bg-indigo-700 transition"
      >
        📅 Select Date
      </button>

      {/* Calendar Modal */}
      {calendarOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <Calendar
              onChange={(date) => {
                setSelectedDate(date);
                setCalendarOpen(false);
              }}
            />
            <button
              onClick={() => setCalendarOpen(false)}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventList;
