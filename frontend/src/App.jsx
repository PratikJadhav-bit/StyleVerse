import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState, useCallback, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { registerToast } from './hooks/useToast';
import Navbar from './components/Navbar/Navbar';
import Home from './pages/Home/Home';
import Collections from './pages/Collections/Collections';
import { LoginPage, RegisterPage } from './pages/Auth/Auth';
import Analytics from './pages/Analytics/Analytics';
import './index.css';

function ToastContainer() {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  }, []);

  useEffect(() => {
    registerToast(showToast);
  }, [showToast]);

  return (
    <div className="toast-wrap">
      {toasts.map(t => (
        <div key={t.id} className={`toast ${t.type === 'success' ? 'toast-success' : t.type === 'error' ? 'toast-error' : ''}`}>
          {t.message}
        </div>
      ))}
    </div>
  );
}

function AppLayout({ children }) {
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ToastContainer />
          <Routes>
            <Route path="/login" element={<><Navbar /><LoginPage /></>} />
            <Route path="/register" element={<><Navbar /><RegisterPage /></>} />
            <Route path="/*" element={
              <AppLayout>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/collections" element={<Collections />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="*" element={<Home />} />
                </Routes>
              </AppLayout>
            } />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
