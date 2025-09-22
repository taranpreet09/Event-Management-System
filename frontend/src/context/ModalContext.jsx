// src/context/ModalContext.jsx
import React, { createContext, useState, useContext } from 'react';

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
  // A more descriptive state name and more possible states
  const [modalView, setModalView] = useState(null); 
  // Possible views: 'CHOICE', 'USER_LOGIN', 'USER_REGISTER', 'ORG_REGISTER'

  const showModal = (view) => setModalView(view);
  const hideModal = () => setModalView(null);

  const value = {
    modalView,
    showModal,
    hideModal,
  };

  return (
    <ModalContext.Provider value={value}>
      {children}
    </ModalContext.Provider>
  );
};