import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Sidebar from './components/Sidebar';
import AppRoutes from './routes/AppRoutes';
import Modal from './components/Modal';
import LoginForm from './components/LoginForm';
import ChoiceScreen from './components/ChoiceScreen';
import RegisterForm from './components/RegisterForm';
import { useModal } from './context/ModalContext';
import OrganisationRegisterForm from './components/OrganisationRegisterForm';
import { ToastContainer, toast } from 'react-toastify';

// ⭐ 1. Import React hooks
import React, { useEffect, useState, useRef } from 'react'; 
import { useAuth } from './context/AuthContext';


function App() {
  const wsRef = useRef(null);
  const { modalView, hideModal } = useModal();
  const { user, isAuthenticated } = useAuth();
  
  // State to hold the list of messages
  const [notifications, setNotifications] = useState([]);
  
  // ⭐ 2. New state to control the red dot
  const [hasUnseenNotifications, setHasUnseenNotifications] = useState(false);

  // Fix stale closure for WebSocket by using a ref
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // ⭐ 3. New function to clear all notifications
  const handleClearNotifications = () => {
    setNotifications([]);
  };

  // ⭐ 4. New function to mark notifications as "seen" (removes red dot)
  const handleViewNotifications = () => {
    setHasUnseenNotifications(false);
  };

  useEffect(() => {
    let ws = null;
    let reconnectTimer = null;
    let reconnectDelay = 1000;
    let isMounted = true;

    const connect = () => {
      if (!isMounted) return;
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) return;

      const wsUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:1111').replace(/^http/, 'ws');
      ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('✅ [WebSocket] Connected to server.');
        reconnectDelay = 1000; // Reset backoff on successful connect
      };

      ws.onmessage = (event) => {
        let data;
        try { data = JSON.parse(event.data); } catch { return; }

        if (data.type === 'BROADCAST_MESSAGE') {
          if (userRef.current && data.organizerId === userRef.current.id) return;
          const title = data.payload.title || 'New Broadcast';
          setNotifications(prev => [
            { id: data.payload?.id || Date.now(), title, text: data.payload.text, type: 'broadcast', organizerName: data.payload?.organizerName || data.organizerName || 'An Organizer' },
            ...prev,
          ]);
          setHasUnseenNotifications(true);
          toast.info(title);
        }

        if (data.type === 'INBOX_MESSAGE') {
          const currentUser = userRef.current;
          if (!currentUser) return;
          const myUserId = String(currentUser.id || currentUser._id || currentUser.userId);
          if (String(data.toUserId) !== myUserId) return;
          
          const title = `New message from ${data.fromName || 'User'}`;
          setNotifications(prev => [
            { id: data.messageId || Date.now(), title, text: data.text, type: 'inbox', conversationId: data.conversationId },
            ...prev,
          ]);
          setHasUnseenNotifications(true);
          toast.info(title);
        }
      };

      ws.onclose = () => {
        console.log('❌ [WebSocket] Disconnected. Reconnecting...');
        wsRef.current = null;
        if (isMounted) {
          reconnectTimer = setTimeout(() => {
            reconnectDelay = Math.min(reconnectDelay * 2, 30000);
            connect();
          }, reconnectDelay);
        }
      };

      ws.onerror = (err) => {
        console.error('❌ [WebSocket] Error:', err);
        // Let onclose handle reconnection
        if (ws.readyState !== WebSocket.CLOSED) ws.close();
      };
    };

    connect();

    return () => {
      isMounted = false;
      clearTimeout(reconnectTimer);
      if (wsRef.current) {
        wsRef.current.onclose = null; // Prevent reconnect on intentional close
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);
// Re-run when user changes so we have the latest user in WS handler

  return (
    <div className="flex bg-background text-on-background font-body min-h-screen">
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
      
      {isAuthenticated && <Sidebar />}
      
      <div className={`flex flex-col flex-grow min-h-screen relative ${isAuthenticated ? 'md:ml-72' : ''}`}>
        <Navbar 
          notifications={notifications}
          hasUnseen={hasUnseenNotifications}
          onView={handleViewNotifications}
          onClear={handleClearNotifications}
        /> 
        
        <main className="flex-grow pb-24 md:pb-0">
          <AppRoutes />
        </main>
        
        <Footer />
      </div>
      
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