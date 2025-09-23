import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom'; // <-- Import Link

const EventCard = ({ eventId, title, date, location, organizerName, onRegister }) => {
  const { isAuthenticated, user } = useAuth();
  
  // Note: Your backend Event model uses _id, so we should use that for the link
  const isMyEvent = user?.id === eventId; 

  
  return (
    <Link to={`/events/${eventId}`} className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-shadow duration-300 ease-in-out flex flex-col group">
      <div className="relative">
        <img src={`https://placehold.co/600x400/a0c4ff/333333?text=${title.replace(/\s+/g, '+')}`} alt={title} className="w-full h-48 object-cover" />
        <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-0 transition-all duration-300"></div>
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <p className="text-sm text-gray-500 mb-2 font-medium">Organized by: <span className="font-bold text-indigo-600">{organizerName}</span></p>
        <h3 className="text-2xl font-bold font-heading mb-3 text-gray-800">{title}</h3>
        <div className="text-gray-600 space-y-2 mb-4">
            <p><strong>Date:</strong> {date}</p>
            <p><strong>Location:</strong> {location}</p>
        </div>
        
        <div className="mt-auto">
          {isAuthenticated && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onRegister(eventId);
              }}
              className="w-full bg-emerald-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-emerald-600 transition-all duration-200 transform hover:scale-105"
            >
              Register
            </button>
          )}
        </div>
      </div>
    </Link>
  );
};

export default EventCard;