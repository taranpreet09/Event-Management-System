
import React, { createContext, useState, useContext } from 'react';

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
  const [modalView, setModalView] = useState(null); 

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