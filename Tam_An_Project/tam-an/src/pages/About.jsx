import React from 'react';

const About = () => {
  return (
    // 1. Thẻ cha: relative để chứa các phần tử con absolute
    <div className="min-h-screen relative flex items-center justify-center p-4">
      
      {/* 2. Hình nền dùng thẻ img với src nội bộ */}
      <img 
        src="/images/background.jpg" 
        alt="Nền trà Tâm An"
        className="absolute inset-0 w-full h-full object-cover" // object-cover giúp ảnh phủ kín màn hình mà không bị méo
      />

      {/* 3. Lớp phủ mờ màu đen 30% */}
      <div className="absolute inset-0 bg-black/30"></div>

      {/* 4. Hộp nội dung chính: Nổi lên trên (z-10) */}
      <div className="relative z-10 max-w-3xl mx-auto text-center text-white p-8 md:p-12 bg-black/20 rounded-2xl backdrop-blur-sm shadow-xl border border-white/10">
        
        {/* Tiêu đề trang */}
        <h1 className="text-4xl md:text-5xl font-bold font-serif mb-6">
          Về Chúng Tôi
        </h1>
        
        {/* Nội dung văn bản */}
        <p className="text-xl md:text-2xl font-serif leading-relaxed opacity-90">
          Câu chuyện về Tiệm trà Tâm An chúng tôi là một tiệm tạp hóa chuyên bán các loại trà ở phường Cao Lãnh tỉnh Đồng Tháp.
        </p>
      </div>
    </div>
  );
};

export default About;