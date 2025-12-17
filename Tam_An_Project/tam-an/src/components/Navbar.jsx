// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const isAdminPage = location.pathname.startsWith('/admin');

  // --- 1. KIỂM TRA LOGIN ---
  const checkLogin = () => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        return parsedUser;
    } else {
        setUser(null);
        return null;
    }
  };

  // --- 2. HÀM CẬP NHẬT SỐ LƯỢNG ---
  const updateCartCount = () => {
    const currentUser = JSON.parse(localStorage.getItem('user'));

    if (currentUser) {
        // ĐÃ ĐĂNG NHẬP -> GỌI API
        fetch(`http://localhost:5000/api/cart/${currentUser.id}`, {
            credentials: 'include'
        })
        .then(res => {
            if (res.ok) return res.json();
            throw new Error('Lỗi fetch cart');
        })
        .then(data => {
            const total = data.reduce((acc, item) => acc + item.quantity, 0);
            setTotalItems(total);
        })
        .catch(err => {
            console.error("Không lấy được số lượng giỏ hàng:", err);
        });
    } else {
        // CHƯA ĐĂNG NHẬP -> LOCALSTORAGE
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

    const handleStorageChange = () => {
      checkLogin();
      updateCartCount();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleLogout = () => {
    fetch('http://localhost:5000/api/logout', { method: 'POST', credentials: 'include' });
    
    localStorage.removeItem('user');
    localStorage.removeItem('token'); // Xóa cả token nếu có lưu
    setUser(null);
    setTotalItems(0);
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex flex-wrap justify-between items-center gap-4">
        
        <Link to="/" className="text-2xl font-bold text-green-700 flex items-center gap-2">
           <span className="font-serif">🌿 Tâm An {isAdminPage && <span className="text-sm bg-red-100 text-red-600 px-2 py-0.5 rounded ml-2">ADMIN</span>}</span>
        </Link>

        {!isAdminPage && (
          <div className="hidden lg:flex space-x-6 text-gray-700 font-medium items-center">
            
            <NavLink to="/" className={({isActive}) => `flex items-center gap-1.5 ${isActive ? "text-green-700" : "hover:text-red-600"}`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
              Trang Chủ
            </NavLink>

            <NavLink to="/shop" className={({isActive}) => `flex items-center gap-1.5 ${isActive ? "text-green-700" : "hover:text-red-600"}`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615 3.001 3.001 0 0 0 3.75.615 3.001 3.001 0 0 0 3.75-.615 3.001 3.001 0 0 0 3.75.615m-15 0-1.44-1.44A3.375 3.375 0 0 1 5.39 4.312l1.171-.293a3.375 3.375 0 0 1 4.174 2.154l.27 1.082a.375.375 0 0 0 .73 0l.27-1.082a3.375 3.375 0 0 1 4.174-2.154l1.171.293a3.375 3.375 0 0 1 2.638 3.597l-1.44 1.44" />
              </svg>
              Cửa Hàng
            </NavLink>

            <NavLink to="/promotions" className={({isActive}) => `flex items-center gap-1.5 ${isActive ? "text-green-700" : "hover:text-red-500"}`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.659A2.25 2.25 0 0 0 9.568 3Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
              </svg>
              Ưu Đãi
            </NavLink>

            <NavLink to="/promotion" className={({isActive}) => `flex items-center gap-1.5 ${isActive ? "text-green-700" : "hover:text-red-500"}`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.91 11.672a.375.375 0 0 1 0 .656l-5.603 3.113a.375.375 0 0 1-.557-.328V8.887c0-.286.307-.466.557-.327l5.603 3.112Z" />
              </svg>
              Quảng cáo
            </NavLink>
            <NavLink to="/reviews" className={({isActive}) => `flex items-center gap-1.5 ${isActive ? "text-green-700" : "hover:text-red-600"}`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.385a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
              </svg>
              Đánh giá
            </NavLink>
            {user && user.role === 'admin' && (
               <NavLink to="/admin" className={({isActive}) => `flex items-center gap-1.5 px-3 py-1 rounded font-bold ${isActive ? "text-red-600 border border-red-200" : "hover:text-red-500"}`}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                  </svg>
                  Quản Lý
               </NavLink>
            )}
          </div>
        )}

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
          {user && (
            <NavLink to="/history" className={({isActive}) => `flex items-center gap-1 ${isActive ? "text-green-700" : "hover:text-green-600 text-sm"}`}>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              Lịch sử
            </NavLink>
          )}
          {user ? (
            <div className="flex items-center gap-2 border-l pl-4 ml-2 border-gray-200">
                <Link to="/profile" className="text-green-800 font-bold text-sm hover:underline hidden sm:block">
                    Chào, {user.name}
                </Link>
                <button onClick={handleLogout} className="text-gray-400 hover:text-red-500 text-sm pl-2">Thoát</button>
            </div>
          ) : (
            <Link to="/login" className="text-gray-600 hover:text-green-700 transition border-l pl-4 ml-2 border-gray-200">
                <span className="text-sm font-bold">Đăng Nhập</span>
            </Link>
          )}
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