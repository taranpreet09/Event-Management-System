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
    <>
      <section className="px-8 md:px-12 py-12 w-full max-w-none relative z-10">
        {/* Hero Title & Controls */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-2xl">
            <span className="font-label text-xs uppercase tracking-[0.2em] text-on-tertiary-fixed-variant mb-4 block">Seasonal Program</span>
            <h2 className="font-headline text-4xl md:text-5xl font-black text-primary leading-[0.9] -tracking-widest">Digital<br/>Discoveries</h2>
          </div>
          <div className="flex items-center gap-2 p-1 bg-surface-container-low rounded-xl">
            <button onClick={() => setFilter('all')} className={`px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors ${filter === 'all' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-slate-500 hover:bg-surface-container-high'}`}>All</button>
            <button onClick={() => setFilter('upcoming')} className={`px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors ${filter === 'upcoming' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-slate-500 hover:bg-surface-container-high'}`}>Upcoming</button>
            <button onClick={() => setFilter('past')} className={`px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-wider transition-colors ${filter === 'past' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-slate-500 hover:bg-surface-container-high'}`}>Past</button>
          </div>
        </div>

        {/* Bento Featured Grid (Preserved Template) */}
        {!searchTerm && filter === 'all' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">
            <div className="md:col-span-8 group cursor-pointer">
              <div className="relative overflow-hidden aspect-[16/9] md:h-[500px] rounded-xl mb-6 bg-surface-container-highest">
                <img alt="tech conference" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="https://lh3.googleusercontent.com/aida-public/AB6AXuA1uAbmUCAz55L4o_D23LB_NtgrrhZ5Wb8khWs-U20GwSFTPsu3sE1NRSIx5LODWwlCZDwEc1R1Y-0uj-Kx2SfLcCZHBenYjTPB7TG3DZdWtjgLH-HSDsY2H4MU9CYjVOZFKsZArSUe8xbAMGd_kKMfLjvlXh7AwGwsR786s7C3njQUueOUxCqE2Y7PwR6SJS0A_GAh_tR0Awo25huejS-V3K3VsJUf6-qI3DFClh5_27Nqd5QRl0KL0_WY8b3EglaTy_4DBYa4Zg"/>
                <div className="absolute top-6 left-6 flex gap-2">
                  <span className="px-3 py-1 bg-tertiary-fixed-dim text-on-tertiary-fixed-variant text-[10px] font-bold uppercase tracking-widest rounded-sm">Featured</span>
                  <span className="px-3 py-1 backdrop-blur-md bg-white/20 text-white text-[10px] font-bold uppercase tracking-widest rounded-sm border border-white/30">In-Person</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-primary/80 to-transparent">
                  <p className="text-white/70 font-label text-xs uppercase tracking-widest mb-2">Nov 24 • London, UK</p>
                  <h3 className="font-headline text-3xl md:text-4xl text-white font-bold leading-tight">The Future of Generative Curation</h3>
                </div>
              </div>
            </div>
            <div className="md:col-span-4 flex flex-col gap-8 h-full md:h-[500px]">
              <div className="bg-surface-container-low p-8 rounded-xl flex flex-col justify-between h-full group cursor-pointer hover:bg-surface-container-high transition-colors">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <span className="px-3 py-1 bg-primary text-white text-[10px] font-bold uppercase tracking-widest rounded-sm">Workshop</span>
                    <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors" data-icon="arrow_outward">arrow_outward</span>
                  </div>
                  <h3 className="font-headline text-2xl font-bold mb-4">Mastering the Editorial Eye</h3>
                  <p className="text-on-surface-variant text-sm leading-relaxed mb-6">Join our senior curators for an intensive 2-day session on aesthetic theory.</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex -space-x-2">
                    <img alt="attendee" className="w-8 h-8 rounded-full border-2 border-surface-container-low object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDTtSw6yuygWr2yVzy9LVwOUxoo85_tMV_N_oPPnnWoCtiOefiHLgJtVU1bSIRLp6beljwWMaFxI2_7NJijCwug9QW3Qk_JjF5y3gP9D_j5orfFhh44l3wtvOecttdSpNgo_Iuk7Z9_BhTDong1rwS6-8GF-qqLxoruJpVOsM_k44Igo47-lKeJwNnNsUsqLR_52ffgob7QGAzrlQQ0S_ra1buZ9D4mvGvrcT6ObXm0ZYBTN8nC2JHGecNnsniMEbdFiNjVk6Zhvw"/>
                    <img alt="attendee" className="w-8 h-8 rounded-full border-2 border-surface-container-low object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCPWMzx0w1EBXkThsIxCJUrIpkxkVtPIQu37GCR3WvDhCLsx7RMpeqNY_z6Jd8fg177vOKb30J4PlGEWkAYyVwh-C-jpt9E6mgF2KLkCljDAaWV11xzWx7pf6RGfJ8uf1IkGQGUm0Jwnc5V0qLX2jYWiBalotUEVpo3RMjZlCC_Sv19nfwgYDviV53N4L6GSJSWwDi9YLEzy2A6F0PLHDNXD1rsv1YSgv_E8TfWmwBO5inrx7XW4iw13w3Vtsp5YwHYDIafmZDxsA"/>
                    <div className="w-8 h-8 rounded-full border-2 border-surface-container-low bg-primary-fixed flex items-center justify-center text-[10px] font-bold text-on-primary-fixed-variant">+12</div>
                  </div>
                  <span className="text-xs font-label uppercase tracking-widest text-on-surface-variant">42 attending</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-center py-24 font-label uppercase tracking-widest text-xs text-on-surface-variant animate-pulse flex flex-col items-center gap-4">
            <span className="material-symbols-outlined text-4xl opacity-50 block" style={{ fontVariationSettings: "'wght' 200" }}>hourglass_top</span>
            <p>Curating Collection...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 text-error font-label uppercase tracking-widest text-xs">{error}</div>
        ) : events.length > 0 ? (
          <motion.div
             className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-8 mt-12"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {events.map((event) => (
              <motion.div key={event._id} variants={itemVariants} className="h-full">
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
          <div className="text-center py-24 flex flex-col items-center gap-6 text-on-surface-variant">
             <span className="material-symbols-outlined text-6xl opacity-30 block" style={{ fontVariationSettings: "'wght' 200" }}>event_busy</span>
            <div>
               <h2 className="text-2xl font-headline font-bold text-primary mb-2">No Archives Found</h2>
               <p className="font-light text-sm">Adjust your parameters to reveal experiences.</p>
            </div>
          </div>
        )}

        {events.length > 0 && (
           <div className="mt-24 border-t border-outline-variant/20 pt-12 flex flex-col items-center">
               <p className="font-label text-xs uppercase tracking-[0.3em] text-slate-400 mb-6">Showing {events.length} Events</p>
               <button className="px-12 py-4 border border-primary text-primary font-bold text-xs uppercase tracking-widest hover:bg-primary hover:text-white transition-all duration-300">
                   Discover More
               </button>
           </div>
        )}
      </section>

      {/* Footer Accent (from Template) */}
      <footer className="mt-20 py-20 bg-primary-container text-white px-8 md:px-12 relative z-10 w-full mb-0 pb-20 border-t border-primary">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mx-auto max-w-7xl">
              <div>
                  <h5 className="font-headline text-4xl font-bold mb-4">Never miss an opening.</h5>
                  <p className="font-body text-slate-400 text-lg max-w-md">Subscribe to the Curator Weekly for exclusive invites to private viewings and masterclasses.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                  <input className="flex-1 bg-white/5 border-0 border-b border-white/20 focus:border-white focus:ring-0 text-white p-4 placeholder-slate-400 font-body" placeholder="Your email address" type="email"/>
                  <button className="bg-surface-container-lowest text-primary px-8 py-4 font-bold text-xs uppercase tracking-widest hover:bg-tertiary-fixed-dim transition-colors">Join Now</button>
              </div>
          </div>
          <div className="mt-20 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between gap-6 mx-auto max-w-7xl">
              <span className="font-headline italic text-xl opacity-50 uppercase tracking-tighter">THE CURATOR</span>
              <div className="flex gap-8 text-[10px] font-label uppercase tracking-widest text-slate-500">
                  <a className="hover:text-white transition-colors" href="#">Terms</a>
                  <a class="hover:text-white transition-colors" href="#">Privacy</a>
                  <a class="hover:text-white transition-colors" href="#">Cookies</a>
                  <span>© 2026 Event Management System. All rights reserved.</span>
              </div>
          </div>
      </footer>
    </>
  );
};

export default EventList;