import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css';
import Home from './pages/Home';
import RoomPage from './pages/RoomPage';
import GamePage from './pages/GamePage.jsx';
import * as RadixToast from '@radix-ui/react-toast';
import { Toast, ToastViewport } from './components/ui/toast';
import '@fortawesome/fontawesome-free/css/all.min.css';


function AppWrapper() {
  const [toast, setToast] = useState({ open: false, message: '', type: 'default' });

  const showToast = (type, message) => setToast({ open: true, type, message });

  return (
    <RadixToast.Provider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home showToast={showToast} />} />
          <Route path="/room/:id" element={<RoomPage showToast={showToast} />} />
          <Route path="/room/:id/game" element={<GamePage showToast={showToast} />} />
        </Routes>
      </BrowserRouter>

      <Toast
        open={toast.open}
        onOpenChange={(open) => setToast(prev => ({ ...prev, open }))}
        type={toast.type}
        title={toast.type === 'success' ? 'Успех' : toast.type === 'error' ? 'Ошибка' : 'Сообщение'}
        description={toast.message}
      />

      <ToastViewport />
    </RadixToast.Provider>
  );
}

createRoot(document.getElementById('root')).render(<AppWrapper />);
