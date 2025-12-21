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
import React, { useEffect, useState,useRef } from 'react'; 
import { useAuth } from './context/AuthContext';


function App() {
  const wsRef = useRef(null);
  const { modalView, hideModal } = useModal();
  const { user } = useAuth();
  
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
  // ⛔ Prevent multiple connections
  if (wsRef.current) return;

  const ws = new WebSocket('ws://localhost:5000');
  wsRef.current = ws;

  ws.onopen = () => {
    console.log('✅ [WebSocket] Connected to server.');
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);
    console.log('🎁 [WebSocket] Message received:', data);

    // 🟣 BROADCAST MESSAGE
    if (data.type === 'BROADCAST_MESSAGE') {
      // organizer ko apna msg na dikhe
      if (user && data.organizerId === user.id) return;

      setNotifications(prev => [
        {
          id: data.payload?.id || Date.now(),
          title: data.payload.title,
          text: data.payload.text,
          type: 'broadcast',
        },
        ...prev,
      ]);

      setHasUnseenNotifications(true);
    }

    // 🔵 INBOX MESSAGE
    if (data.type === 'INBOX_MESSAGE') {
      if (!user) return;

      const myUserId = user.id || user._id || user.userId;
      if (data.toUserId !== myUserId) return;

      setNotifications(prev => [
        {
          id: data.messageId || Date.now(),
          title: `New message from ${data.fromName || 'User'}`,
          text: data.text,
          type: 'inbox',
          conversationId: data.conversationId,
        },
        ...prev,
      ]);

      setHasUnseenNotifications(true);
    }
  };

  ws.onclose = () => {
    console.log('❌ [WebSocket] Disconnected.');
    wsRef.current = null;
  };

  ws.onerror = (err) => {
    console.error('❌ [WebSocket] Error:', err);
  };

  return () => {
    ws.close();
    wsRef.current = null;
  };
}, []); // ✅ EMPTY dependency — VERY IMPORTANT
// Re-run when user changes so we have the latest user in WS handler

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