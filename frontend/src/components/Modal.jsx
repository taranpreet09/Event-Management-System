import React from 'react';

const Modal = ({ children, onClose }) => {
  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 bg-black bg-opacity-60 z-40 flex justify-center items-center transition-opacity duration-300 ease-in-out"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-2xl z-50 p-8 relative max-w-md w-full transform transition-all duration-300 ease-in-out scale-95 opacity-100"
        style={{ transform: 'scale(1)', opacity: '1' }}
      >
        <button 
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-800 text-3xl font-light transition-colors duration-200"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;