// src/App.jsx

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AppRoutes from './routes/AppRoutes';
import Modal from './components/Modal';
import LoginForm from './components/LoginForm';
import ChoiceScreen from './components/ChoiceScreen';
import RegisterForm from './components/RegisterForm';
import { useModal } from './context/ModalContext'; // Note the corrected path './'
import OrganisationRegisterForm from './components/OrganisationRegisterForm';

function App() {
  // We get everything we need from the context! No local useState needed here.
const { modalView, hideModal } = useModal();

  return (
    <div className="flex flex-col min-h-screen">
      {/* Navbar no longer needs props passed to it. It gets what it needs from the context itself. */}
      <Navbar /> 
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <AppRoutes />
      </main>
      
      <Footer />
      
      {/* This logic correctly reads from the context to decide which modal to show */}
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