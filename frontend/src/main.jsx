// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import './index.css'
import { ModalProvider } from './context/ModalContext'; // Import the provider
import { AuthProvider } from './context/AuthContext';
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>

      <ModalProvider> {/* Wrap the App */}
        <AuthProvider>
        <App />
        </AuthProvider>
      </ModalProvider>
      
    </BrowserRouter>
  </React.StrictMode>,
)