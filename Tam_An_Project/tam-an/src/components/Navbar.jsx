import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'; // 1. Thêm useLocation

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // 2. Lấy đường dẫn hiện tại
  const [user, setUser] = useState(null);

  // Kiểm tra xem có đang ở trang Admin không
  const isAdminPage = location.pathname === '/admin';

  const checkLogin = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    checkLogin();
    window.addEventListener('storage', checkLogin);
    return () => {
      window.removeEventListener('storage', checkLogin);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-green-700 flex items-center gap-2">
           <span className="font-serif">🌿 Tâm An {isAdminPage && <span className="text-sm bg-red-100 text-red-600 px-2 py-0.5 rounded ml-2">ADMIN</span>}</span>
        </Link>

        {/* --- MENU CHÍNH: Chỉ hiện khi KHÔNG PHẢI trang Admin --- */}
        {!isAdminPage && (
          <div className="hidden md:flex space-x-8 text-gray-700 font-medium">
            <NavLink to="/" className={({isActive}) => isActive ? "text-green-700" : "hover:text-green-600"}>Trang Chủ</NavLink>
            <NavLink to="/shop" className={({isActive}) => isActive ? "text-green-700" : "hover:text-green-600"}>Cửa Hàng</NavLink>
            {user && user.role === 'admin' && (
               <NavLink to="/admin" className={({isActive}) => isActive ? "text-red-600 font-bold" : "hover:text-red-500 font-bold"}>Quản Lý</NavLink>
            )}
            <NavLink to="/about" className={({isActive}) => isActive ? "text-green-700" : "hover:text-green-600"}>Về Chúng Tôi</NavLink>
          </div>
        )}

        {/* Khu vực bên phải */}
        <div className="flex items-center space-x-5">
          
          {user ? (
            <div className="flex items-center gap-3">
                <Link to="/profile" className="text-green-800 font-bold text-sm hover:underline">
                    Chào, {user.name}
                </Link>
                
                <button 
                    onClick={handleLogout}
                    className="text-gray-400 hover:text-red-500 text-sm border-l pl-3 ml-1"
                >
                    Thoát
                </button>
            </div>
          ) : (
            <Link to="/login" className="text-gray-600 hover:text-green-700 transition">
                {/* Icon User cũ của bạn */}
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
            </Link>
          )}

          {/* --- GIỎ HÀNG: Chỉ hiện khi KHÔNG PHẢI trang Admin --- */}
          {!isAdminPage && (
            <Link to="/cart" className="text-gray-600 hover:text-green-700 transition relative">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 5.407c.441 1.886.661 2.829.056 3.575-.605.746-1.57.746-3.498.746H8.623c-1.928 0-2.893 0-3.498-.746-.605-.746-.385-1.689.056-3.575l1.263-5.407c.228-.978.342-1.467.674-1.82.332-.353.832-.353 1.832-.353h6.1c1 0 1.5 0 1.832.353.332.353.446.842.674 1.82Z" />
              </svg>
            </Link>
          )}

        </div>
      </div>
    </nav>
  );
};

export default Navbar;