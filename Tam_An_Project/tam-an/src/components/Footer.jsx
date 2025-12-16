// src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    // Sử dụng Flexbox để chia cột
    <footer className="bg-tea-dark text-white py-10 px-4 sm:px-8 mt-auto border-t border-green-800/50">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-start gap-8">

        {/* --- CỘT TRÁI: THÔNG TIN LIÊN HỆ --- */}
        <div className="md:max-w-md">
           {/* Tên thương hiệu nổi bật */}
           <Link to="/" className="text-2xl font-serif font-bold mb-4 block hover:text-green-300 transition">
              🌿 Tâm An Tea
           </Link>
            
            <div className="mt-4 space-y-2 text-gray-200 text-sm leading-relaxed">
                <p className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    <span>61 Hùng Vương, Phường Cao Lãnh, Tỉnh Đồng Tháp</span>
                </p>
                <p className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    <span>0918.999.636</span>
                </p>
                <p className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    <span>lamdinhdt2004@gmail.com</span>
                </p>
            </div>
        </div>

        {/* --- CỘT PHẢI: LOGO & LIÊN KẾT --- */}
        <div className="flex flex-col items-start md:items-end">
            
            {/* LOGO (Sẽ hiển thị chữ nếu ảnh lỗi) */}
            <Link to="/" className="mb-6 block">
                {/* 👉 BẠN CẦN THAY ĐƯỜNG DẪN ẢNH LOGO CỦA BẠN VÀO ĐÂY */}
                <img 
                    src="/images/logo-white.png" 
                    alt="Tâm An Tea Logo" 
                    className="h-20 w-auto object-contain opacity-90 hover:opacity-100 transition"
                    onError={(e) => { e.target.style.display = 'none'; }} // Ẩn ảnh nếu lỗi
                />
            </Link>

            {/* NAVIGATION LINKS */}
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-right">
                <div className="flex flex-col space-y-2">
                    <h4 className="font-bold text-white mb-1">Về Chúng Tôi</h4>
                    <Link to="/about" className="text-gray-300 hover:text-green-300 hover:underline transition text-sm">
                        Câu chuyện thương hiệu
                    </Link>
                    <Link to="/delivery" className="text-gray-300 hover:text-green-300 hover:underline transition text-sm">
                        Điều khoản giao hàng
                    </Link>
                </div>
                <div className="flex flex-col space-y-2">
                     <h4 className="font-bold text-white mb-1">Khám Phá</h4>
                    <Link to="/shop" className="text-gray-300 hover:text-green-300 hover:underline transition text-sm">
                        Cửa Hàng
                    </Link>
                    <Link to="/promotions" className="text-gray-300 hover:text-green-300 hover:underline transition text-sm">
                        Ưu Đãi
                    </Link>
                </div>
            </div>

        </div>

      </div>
      
      {/* Dòng bản quyền dưới cùng */}
      <div className="text-center text-gray-400 text-sm mt-10 pt-6 border-t border-green-800/30 flex flex-col sm:flex-row justify-between items-center">
        <p>&copy; 2025 Tiệm trà Tâm An.</p>
        <p className="mt-2 sm:mt-0">Tinh hoa trà Việt - Hương vị bình yên.</p>
      </div>

    </footer>
  );
};

export default Footer;