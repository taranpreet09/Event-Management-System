import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AppRoutes from './routes/AppRoutes';
import Modal from './components/Modal';
import LoginForm from './components/LoginForm';
import ChoiceScreen from './components/ChoiceScreen';
import RegisterForm from './components/RegisterForm';
import { useModal } from './context/ModalContext';
import OrganisationRegisterForm from './components/OrganisationRegisterForm';
import { ToastContainer } from 'react-toastify';

// ⭐ 1. Import React hooks
import React, { useEffect, useState } from 'react'; 

function App() {
  const { modalView, hideModal } = useModal();
  
  // State to hold the list of messages
  const [notifications, setNotifications] = useState([]);
  
  // ⭐ 2. New state to control the red dot
  const [hasUnseenNotifications, setHasUnseenNotifications] = useState(false);

  // ⭐ 3. New function to clear all notifications
  const handleClearNotifications = () => {
    setNotifications([]);
  };

  // ⭐ 4. New function to mark notifications as "seen" (removes red dot)
  const handleViewNotifications = () => {
    setHasUnseenNotifications(false);
  };

  useEffect(() => {
    // Connect to your backend's port (5000)
    const ws = new WebSocket('ws://localhost:5000');

    ws.onopen = () => {
      console.log('✅ [WebSocket] Connected to server.');
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('🎁 [WebSocket] Message received:', data);

      if (data.type === 'EVENT_ADDED') {
        // Backend now sends { type: 'EVENT_ADDED', event: {...}, userId }
        alert(`🎉 NEW EVENT ADDED: ${data.event?.title || 'Unknown title'}`);
      
      } else if (data.type === 'EVENT_DELETED') {
        // Backend sends { type: 'EVENT_DELETED', eventName, eventId, organizerId }
        alert(`🗑️ EVENT DELETED: ${data.eventName || 'Unknown event'}`);

      } else if (data.type === 'BROADCAST_MESSAGE') {
        console.log('New broadcast!', data.payload);
        
        // Add new notification to the top of the list
        setNotifications((prevNotifications) => [
          data.payload, 
          ...prevNotifications, 
        ]);
        
        // ⭐ 5. Activate the red dot
        setHasUnseenNotifications(true); 
        
        alert(`🔔 NEW NOTIFICATION: ${data.payload.title}`);
      
      } else if (data.type === 'welcome') {
        console.log(`[WebSocket] Server says: ${data.message}`);
      }
    };

    ws.onclose = () => {
      console.log('❌ [WebSocket] Disconnected from server.');
    };

    ws.onerror = (error) => {
      console.error('❌ [WebSocket] Error:', error);
    };

    // Cleanup: Close the connection when the app unmounts
    return () => {
      ws.close();
    };
  }, []); // The empty array [] means this runs only ONCE

  return (
    <div className="flex flex-col min-h-screen">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      {/* ⭐ 6. Pass all the new props to the Navbar */}
      <Navbar 
        notifications={notifications}
        hasUnseen={hasUnseenNotifications}
        onView={handleViewNotifications}
        onClear={handleClearNotifications}
      /> 
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <AppRoutes />
      </main>
      
      <Footer />
      
      {modalView && (
        <Modal onClose={hideModal}>
            {modalView === 'CHOICE' && <ChoiceScreen />}
          {modalView === 'USER_LOGIN' && <LoginForm />}
          {modalView === 'USER_REGISTER' && <RegisterForm />}
          {modalView === 'ORG_REGISTER' && <OrganisationRegisterForm />}
        </Modal>
      )}
    </div>
  )
}

export default App;