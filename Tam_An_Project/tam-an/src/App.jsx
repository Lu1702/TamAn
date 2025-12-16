// src/App.jsx
import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';

// Import Components
import Navbar from './components/Navbar';
import Footer from './components/Footer'; // <--- 1. Import Footer Mới
import AnimatedPage from './components/AnimatedPage';

// Import Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import Product from './pages/Product';
import Cart from './pages/Cart';
import About from './pages/About';
import Login from './pages/Login';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import Checkout from './pages/Checkout';
import Promotions from './pages/Promotions';
import Delivery from './pages/Delivery';
function App() {
  const location = useLocation();

  return (
    <div className="font-sans text-gray-800 min-h-screen flex flex-col">
      
      {/* Navbar */}
      <Navbar />

      {/* Nội dung chính (Có hiệu ứng chuyển trang) */}
      <div className="flex-1"> 
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/" element={<AnimatedPage><Home /></AnimatedPage>} />
            <Route path="/shop" element={<AnimatedPage><Shop /></AnimatedPage>} />
            <Route path="/product/:id" element={<AnimatedPage><Product /></AnimatedPage>} />
            <Route path="/cart" element={<AnimatedPage><Cart /></AnimatedPage>} />
            <Route path="/about" element={<AnimatedPage><About /></AnimatedPage>} />
            <Route path="/login" element={<AnimatedPage><Login /></AnimatedPage>} />
            <Route path="/admin" element={<AnimatedPage><Admin /></AnimatedPage>} />
            <Route path="/profile" element={<AnimatedPage><Profile /></AnimatedPage>} />
            <Route path="/checkout" element={<AnimatedPage><Checkout /></AnimatedPage>} />
            <Route path="/delivery" element={<AnimatedPage><Delivery /></AnimatedPage>} />
            <Route path="/promotions" element={<AnimatedPage><Promotions /></AnimatedPage>} />
            <Route path="*" element={<div className="text-center py-10">404 - Không tìm thấy trang</div>} />
          </Routes>
        </AnimatePresence>
      </div>

      {/* Footer Mới */}
      <Footer /> {/* <--- 2. Sử dụng Component Footer tại đây */}
      
    </div>
  );
}

export default App;