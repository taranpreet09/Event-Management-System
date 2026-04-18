import React from 'react';

const Modal = ({ children, onClose }) => {
  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-in-out"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-surface w-full max-w-4xl overflow-hidden rounded-xl shadow-2xl ring-1 ring-on-surface/5 relative transform transition-all duration-300 ease-in-out"
      >
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 text-on-surface-variant hover:text-primary transition-colors duration-200"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;