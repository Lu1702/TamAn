// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const isAdminPage = location.pathname === '/admin';

  // --- 1. KIỂM TRA LOGIN ---
  const checkLogin = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        return parsedUser; // Trả về user để dùng ngay
    } else {
        setUser(null);
        return null;
    }
  };

  // --- 2. HÀM CẬP NHẬT SỐ LƯỢNG (QUAN TRỌNG: ĐÃ SỬA) ---
  const updateCartCount = () => {
    const currentUser = JSON.parse(localStorage.getItem('user'));

    if (currentUser) {
        // TRƯỜNG HỢP A: ĐÃ ĐĂNG NHẬP -> GỌI API ĐỂ ĐẾM
        fetch(`http://localhost:5000/api/cart/${currentUser.id}`, {
            credentials: 'include' // Gửi Cookie để xác thực
        })
        .then(res => {
            if (res.ok) return res.json();
            throw new Error('Lỗi fetch cart');
        })
        .then(data => {
            // Cộng tổng số lượng (quantity) của các món trong DB
            const total = data.reduce((acc, item) => acc + item.quantity, 0);
            setTotalItems(total);
        })
        .catch(err => {
            console.error("Không lấy được số lượng giỏ hàng:", err);
            // Nếu lỗi (vd hết hạn token), có thể set về 0 hoặc giữ nguyên
        });
    } else {
        // TRƯỜNG HỢP B: CHƯA ĐĂNG NHẬP -> ĐỌC LOCALSTORAGE
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const total = cart.reduce((acc, item) => acc + item.quantity, 0);
        setTotalItems(total);
    }
  };

  // --- 3. SEARCH ---
  const handleSearch = (e) => {
    e.preventDefault(); 
    if (searchTerm.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchTerm)}`);
      setSearchTerm('');
    }
  };

  // --- 4. USE EFFECT ---
  useEffect(() => {
    checkLogin();
    updateCartCount();

    // Lắng nghe sự kiện thay đổi giỏ hàng (từ Shop/Product bắn ra)
    const handleStorageChange = () => {
      checkLogin();
      updateCartCount();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []); // Chạy 1 lần khi mount và lắng nghe sự kiện

  const handleLogout = () => {
    // Gọi API Logout để xóa Cookie
    fetch('http://localhost:5000/api/logout', { method: 'POST', credentials: 'include' });
    
    localStorage.removeItem('user');
    setUser(null);
    setTotalItems(0); // Reset số lượng về 0
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex flex-wrap justify-between items-center gap-4">
        
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-green-700 flex items-center gap-2">
           <span className="font-serif">🌿 Tâm An {isAdminPage && <span className="text-sm bg-red-100 text-red-600 px-2 py-0.5 rounded ml-2">ADMIN</span>}</span>
        </Link>

        {/* --- MENU CHÍNH --- */}
        {!isAdminPage && (
          <div className="hidden lg:flex space-x-8 text-gray-700 font-medium">
            <NavLink to="/" className={({isActive}) => isActive ? "text-green-700" : "hover:text-green-600"}>Trang Chủ</NavLink>
            <NavLink to="/shop" className={({isActive}) => isActive ? "text-green-700" : "hover:text-green-600"}>Cửa Hàng</NavLink>
            <NavLink to="/promotions" className={({isActive}) => isActive ? "text-red-600 font-bold" : "hover:text-red-500 font-bold"}>Ưu Đãi</NavLink>
            <NavLink to="/about" className={({isActive}) => isActive ? "text-green-700" : "hover:text-green-600"}>Về Chúng Tôi</NavLink>
            {user && user.role === 'admin' && (
               <NavLink to="/admin" className={({isActive}) => isActive ? "text-red-600 font-bold" : "hover:text-red-500 font-bold"}>Quản Lý</NavLink>
            )}
          </div>
        )}

        {/* Khu vực bên phải */}
        <div className="flex items-center space-x-4 ml-auto">
          
          {/* Form Tìm kiếm */}
          {!isAdminPage && (
            <form onSubmit={handleSearch} className="relative hidden md:block group">
                <input 
                    type="text" 
                    placeholder="Tìm trà..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-4 pr-10 py-1.5 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600 w-48 transition-all focus:w-64"
                />
                <button type="submit" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-green-700">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
                    </svg>
                </button>
            </form>
          )}

          {/* User Info */}
          {user ? (
            <div className="flex items-center gap-2 border-l pl-4 ml-2 border-gray-200">
                <Link to="/profile" className="text-green-800 font-bold text-sm hover:underline hidden sm:block">
                    Chào, {user.name}
                </Link>
                <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 text-sm pl-2">Thoát</button>
            </div>
          ) : (
            <Link to="/login" className="text-gray-600 hover:text-green-700 transition border-l pl-4 ml-2 border-gray-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
            </Link>
          )}

          {/* Icon Giỏ hàng */}
          {!isAdminPage && (
            <Link to="/cart" className="relative text-gray-600 hover:text-green-700 transition">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 5.407c.441 1.886.661 2.829.056 3.575-.605.746-1.57.746-3.498.746H8.623c-1.928 0-2.893 0-3.498-.746-.605-.746-.385-1.689.056-3.575l1.263-5.407c.228-.978.342-1.467.674-1.82.332-.353.832-.353 1.832-.353h6.1c1 0 1.5 0 1.832.353.332.353.446.842.674 1.82Z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-white">
                  {totalItems}
                </span>
              )}
            </Link>
          )}

        </div>
      </div>
    </nav>
  );
};

export default Navbar;