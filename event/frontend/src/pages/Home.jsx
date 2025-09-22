import React, { useEffect, useRef } from 'react';
import { useModal } from '../context/ModalContext';

const Home = () => {
  const { showModal } = useModal();
  // useRef to prevent re-creating functions on every render
  const triggered = useRef(false);

  useEffect(() => {
    // This function will contain the logic to show the modal and clean up
    const triggerModal = () => {
      // 1. Check if the modal has already been shown in this session
      if (sessionStorage.getItem('proactiveModalShown')) {
        return;
      }
      
      // 2. Check an internal flag to prevent multiple triggers from firing at once
      if (triggered.current) {
        return;
      }

      // 3. Mark as triggered, show the modal, and set the session flag
      triggered.current = true;
      showModal('CHOICE');
      sessionStorage.setItem('proactiveModalShown', 'true');

      // 4. Clean up listeners and timers
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timerId);
    };

    // Handler for the scroll event
    const handleScroll = () => {
      const scrollPercentage = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
      if (scrollPercentage > 25) {
        triggerModal();
      }
    };

    // Set up a timer as a fallback
    const timerId = setTimeout(triggerModal, 7000); // 7 seconds

    // Add the scroll event listener
    window.addEventListener('scroll', handleScroll);

    // This is the cleanup function. It runs when the component is unmounted.
    // It's crucial for preventing memory leaks.
    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timerId);
    };
  }, [showModal]); // Dependency array ensures this effect runs only once on mount

  return (
    <div className="text-center">
      <div className="py-20 bg-white rounded-lg shadow-xl">
        <h1 className="text-5xl font-extrabold text-gray-800 mb-4">Welcome to EventManager</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          The central place to discover, create, and manage all your events. Scroll down to see what's happening.
        </p>
      </div>
      
      {/* Placeholder content to make the page scrollable */}
      <div className="mt-16 space-y-12 text-left max-w-4xl mx-auto">
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Discover Amazing Events</h2>
          <p className="text-lg text-gray-600">
            From tech conferences and music festivals to local meetups and workshops, find events that match your passion. Our platform makes it easy to see what's happening in your area and around the world. Sign up to get personalized recommendations and save events you're interested in.
          </p>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">For Organisers</h2>
          <p className="text-lg text-gray-600">
            Planning an event? We give you the tools you need to succeed. Create beautiful event pages, manage ticket sales, and engage with your attendees all in one place. Our dashboard provides valuable insights to help you grow your audience and make every event a success. Create an organisation account to get started.
          </p>
        </div>
        <div>
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Seamless Experience</h2>
          <p className="text-lg text-gray-600">
            Our platform is designed to be intuitive and easy to use for both attendees and organisers. With secure payments, real-time updates, and a mobile-friendly design, managing your events has never been easier. We handle the logistics so you can focus on creating memorable experiences.
          </p>
        </div>
        <div className="h-48"></div> {/* Extra space at the bottom */}
      </div>
    </div>
  );
};

export default Home;