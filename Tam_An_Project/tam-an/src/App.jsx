// src/App.jsx
import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom'; // 1. Thêm useLocation
import { AnimatePresence } from 'framer-motion'; // 2. Thêm AnimatePresence

import Navbar from './components/Navbar';
import AnimatedPage from './components/AnimatedPage'; // 3. Import component hiệu ứng

// Import các Pages
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
function App() {
  const location = useLocation(); // 4. Lấy vị trí trang hiện tại để làm Key cho hiệu ứng

  return (
    <div className="font-sans text-gray-800 min-h-screen flex flex-col">
      
      {/* Navbar luôn hiển thị ở trên cùng */}
      <Navbar />

      {/* Nội dung thay đổi theo Route */}
      <div className="flex-1"> 
        {/* 5. Bọc Routes bằng AnimatePresence với mode="wait" */}
        {/* mode="wait" nghĩa là: Trang cũ biến mất hẳn rồi trang mới mới hiện ra */}
        <AnimatePresence mode="wait">
          
          {/* 6. Truyền location và key vào Routes để React nhận biết khi nào đổi trang */}
          <Routes location={location} key={location.pathname}>
            
            {/* 7. Bọc từng Element bằng <AnimatedPage> */}
            <Route path="/" element={<AnimatedPage><Home /></AnimatedPage>} />
            <Route path="/shop" element={<AnimatedPage><Shop /></AnimatedPage>} />
            <Route path="/product/:id" element={<AnimatedPage><Product /></AnimatedPage>} />
            <Route path="/cart" element={<AnimatedPage><Cart /></AnimatedPage>} />
            <Route path="/about" element={<AnimatedPage><About /></AnimatedPage>} />
            <Route path="/login" element={<AnimatedPage><Login /></AnimatedPage>} />
            <Route path="/admin" element={<AnimatedPage><Admin /></AnimatedPage>} />
            <Route path="/profile" element={<AnimatedPage><Profile /></AnimatedPage>} />
            <Route path="/checkout" element={<AnimatedPage><Checkout /></AnimatedPage>} />
            <Route path="/promotions" element={<AnimatedPage><Promotions /></AnimatedPage>} />
            <Route path="*" element={<div className="text-center py-10">404 - Không tìm thấy trang</div>} />
          </Routes>
        
        </AnimatePresence>
      </div>

      {/* Footer */}
      <footer className="bg-tea-dark text-white text-center py-6 mt-auto">
        <p>&copy; 2025 Tâm An Tiệm trà bán các loại trà ngon vl.</p>
      </footer>
    </div>
  );
}

export default App;