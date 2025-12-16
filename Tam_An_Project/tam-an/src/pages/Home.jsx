import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="min-h-screen bg-earth-beige">
      <div className="relative h-screen flex items-center justify-center bg-tea-dark overflow-hidden">
        
        {/* Lớp phủ tối */}
        <div className="absolute inset-0 bg-black/30 z-10"></div>
        
        {/* Hình nền */}
        <img 
          src="/images/background.jpg" 
          className="absolute inset-0 w-full h-full object-cover" 
          alt="Tea field" 
        />
        
        {/* Nội dung chính */}
        <div className="relative z-20 text-center text-white px-4">
          <h1 className="text-5xl md:text-7xl font-serif font-bold mb-6 drop-shadow-lg">Tiệm trà Tâm An</h1>
          <p className="text-xl md:text-2xl mb-12 font-light max-w-2xl mx-auto drop-shadow-md">Thưởng thức hương vị bình yên trong từng gói trà.</p>
          
          {/* NÚT BẤM MỚI VỚI STYLE CSS TÙY CHỈNH */}
          <Link to="/shop" className="button">
            <span>Khám Phá Ngay</span>
            {/* SVG Mũi tên được cấu tạo bởi 3 đa giác để tạo hiệu ứng animation */}
            <svg viewBox="0 0 15 15" xmlns="http://www.w3.org/2000/svg">
              <polygon points="2,2 12,7.5 2,13" />
              <polygon points="2,2 12,7.5 2,13" />
              <polygon points="2,2 12,7.5 2,13" />
            </svg>
          </Link>

        </div>
      </div>
    </div>
  );
};

export default Home;