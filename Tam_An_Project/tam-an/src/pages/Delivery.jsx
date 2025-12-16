import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Delivery = () => {
    return (
    <div className="min-h-screen relative flex items-center justify-center p-4">
      <img 
        src="/images/background.jpg" 
        alt="Nền trà Tâm An"
        className="absolute inset-0 w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-black/30"></div>
      <div className="relative z-10 max-w-3xl mx-auto text-center text-white p-8 md:p-12 bg-black/20 rounded-2xl backdrop-blur-sm shadow-xl border border-white/10">
        <h1 className="text-4xl md:text-5xl font-bold font-serif mb-6">
          Điều khoản giao hàng
        </h1>
        <p className="text-xl md:text-2xl font-serif leading-relaxed opacity-90">
          Ở những nơi trong nội ô phường Cao Lãnh chúng tôi sẽ miễn phí giao hàng
        </p>
        <br></br>
        <p className="text-xl md:text-2xl font-serif leading-relaxed opacity-90">
          Ở những nơi khác chúng tôi phải tính thêm phí giao hàng là 100.000 VND cho mỗi lần giao!
        </p>
      </div>
    </div>
  );
}
export default Delivery;