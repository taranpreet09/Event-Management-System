
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { ModalProvider } from './context/ModalContext'; 
import { AuthProvider } from './context/AuthContext';
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>

      <ModalProvider> 
        <AuthProvider>
        <App />
        </AuthProvider>
      </ModalProvider>
      
    </BrowserRouter>
  </React.StrictMode>,
)