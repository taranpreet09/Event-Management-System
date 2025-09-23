import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useModal } from '../context/ModalContext';

// --- Icon Components ---
const CalendarCheckIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
    <path d="m9 16 2 2 4-4" />
  </svg>
);

const UsersIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const TicketIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M2 9a3 3 0 0 1 0 6v1a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-1a3 3 0 0 1 0-6V8a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
    <path d="M13 5v2" />
    <path d="M13 17v2" />
    <path d="M13 11v2" />
  </svg>
);

const ArrowRightIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
    <path d="M5 12h14" />
    <path d="m12 5 7 7-7 7" />
  </svg>
);

const Home = () => {
  const { showModal } = useModal();
  const triggered = useRef(false);

  useEffect(() => {
    const triggerModal = () => {
      if (sessionStorage.getItem('proactiveModalShown')) return;
      if (triggered.current) return;

      triggered.current = true;
      showModal('CHOICE');
      sessionStorage.setItem('proactiveModalShown', 'true');

      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timerId);
    };

    const handleScroll = () => {
      const scrollPercentage = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercentage > 25) triggerModal();
    };

    const timerId = setTimeout(triggerModal, 7000);
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timerId);
    };
  }, [showModal]);

  return (
    <div className="bg-gray-50 text-gray-800">
      {/* --- Hero Section --- */}
      <main className="relative overflow-hidden">
        <div aria-hidden="true" className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-gray-100 -z-10" />
        <div aria-hidden="true" className="absolute -top-48 left-1/2 -z-10 h-[42.375rem] w-[42.375rem] -translate-x-1/2 rounded-full bg-gradient-to-tr from-[#93c5fd] to-[#3b82f6] opacity-20" />

        <div className="container mx-auto px-6 lg:px-8 pt-24 pb-20 sm:pt-32 sm:pb-28 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900">
            Organize, Manage, and Host
            <span className="block text-indigo-600">Unforgettable Events</span>
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg sm:text-xl text-gray-600">
            From small meetups to large-scale conferences, EventManager provides all the tools you need to create successful and engaging events, seamlessly.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link to="/events" className="rounded-md bg-indigo-600 px-6 py-3 text-lg font-semibold text-white shadow-lg hover:bg-indigo-500 focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 transition">
              Browse Events
            </Link>
            <Link to="/dashboard" className="group flex items-center gap-x-2 text-lg font-semibold text-gray-900 hover:text-indigo-600 transition">
              Manage Your Events <ArrowRightIcon className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </main>

      {/* --- Features Section --- */}
      <section id="features" className="bg-white py-20 sm:py-28">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-2xl mx-auto lg:mx-0">
            <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">Everything You Need, All in One Place</h2>
            <p className="mt-4 text-lg text-gray-600">Our platform is designed to be powerful for organizers yet simple for attendees.</p>
          </div>

          <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            <div className="flex flex-col items-start p-8 bg-gray-50 rounded-2xl shadow-sm hover:shadow-lg">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-indigo-100 text-indigo-600 mb-6">
                <CalendarCheckIcon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">Seamless Event Creation</h3>
              <p className="mt-2 text-base text-gray-600">Effortlessly create and customize your event pages. Add schedules, speaker bios, and venue details in minutes.</p>
            </div>

            <div className="flex flex-col items-start p-8 bg-gray-50 rounded-2xl shadow-sm hover:shadow-lg">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-indigo-100 text-indigo-600 mb-6">
                <TicketIcon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">Easy Ticketing & RSVP</h3>
              <p className="mt-2 text-base text-gray-600">Manage registrations and sell tickets directly from your event page. Track attendees and get real-time insights.</p>
            </div>

            <div className="flex flex-col items-start p-8 bg-gray-50 rounded-2xl shadow-sm hover:shadow-lg">
              <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-indigo-100 text-indigo-600 mb-6">
                <UsersIcon className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">Attendee Engagement</h3>
              <p className="mt-2 text-base text-gray-600">Keep your audience engaged with tools for communication, feedback collection, and community building before and after the event.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="bg-gray-900 text-white">
        <div className="container mx-auto py-12 px-6 lg:px-8">
          <div className="flex justify-between items-center flex-wrap gap-8">
            <div>
              <h3 className="text-xl font-bold">EventManager</h3>
              <p className="text-gray-400 mt-2">Making every event a success.</p>
            </div>
            <div className="flex gap-x-8">
              <Link to="/events" className="text-gray-300 hover:text-white">Events</Link>
              <Link to="/dashboard" className="text-gray-300 hover:text-white">Dashboard</Link>
              <Link to="#" className="text-gray-300 hover:text-white">Contact</Link>
            </div>
          </div>
          <div className="mt-12 border-t border-gray-800 pt-8 text-center text-gray-500">
            <p>&copy; {new Date().getFullYear()} EventManager. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
