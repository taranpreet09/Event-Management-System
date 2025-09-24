
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

function App() {
const { modalView, hideModal } = useModal();

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
      
      <Navbar /> 
      
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