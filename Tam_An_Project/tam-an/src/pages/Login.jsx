// src/pages/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true); // Toggle Login/Register
  const [error, setError] = useState(''); // State để hiển thị lỗi
  const [loading, setLoading] = useState(false); // State loading

  // State lưu dữ liệu form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  // Hàm cập nhật state khi nhập liệu
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value // Cập nhật field tương ứng (email, pass, name)
    });
  };

  // Hàm gửi dữ liệu lên Server
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); 
    setLoading(true);

    const endpoint = isLogin ? '/api/login' : '/api/register';

    try {
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include', // QUAN TRỌNG
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));

        // Logic gộp giỏ hàng
        const localCart = JSON.parse(localStorage.getItem('cart')) || [];
        if (localCart.length > 0) {
            try {
                await Promise.all(localCart.map(item => {
                    return fetch('http://localhost:5000/api/cart/add', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include', 
                        body: JSON.stringify({
                            user_id: data.user.id,    
                            product_id: item.id,      
                            quantity: item.quantity    
                        })
                    });
                }));
                localStorage.removeItem('cart');
            } catch (err) {
                console.error("Lỗi khi đồng bộ giỏ hàng:", err);
            }
        }
        
        window.dispatchEvent(new Event("storage"));
        alert(data.message);
        
        if (data.user.role === 'admin') navigate('/admin');
        else navigate('/');

      } else {
        setError(data.message);
      }

    } catch (err) {
      setError("Lỗi kết nối đến Server! Hãy kiểm tra backend.");
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 overflow-hidden">
      
      {/* --- LỚP BACKGROUND (ĐÃ BỎ OPACITY) --- */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{ 
            backgroundImage: "url('/images/background.jpg')",
            // Đã xóa dòng opacity ở đây để ảnh rõ nét
        }}
      ></div>

      {/* Lớp phủ đen nhẹ để form nổi bật hơn (nếu muốn bỏ nốt cái này thì xóa dòng dưới đi) */}
      <div className="absolute inset-0 z-0 bg-black/10 pointer-events-none"></div>

      {/* Nội dung chính */}
      <div className="relative z-10 max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Cột Trái: Hình ảnh minh họa */}
        <div className="w-full md:w-1/2 bg-green-800 text-white p-10 flex flex-col justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-20 z-10"></div>
          <img 
            src="https://images.unsplash.com/photo-1597318181409-cf64d0b5d8a2?q=80&w=1000&auto=format&fit=crop" 
            alt="Tea background" 
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="relative z-20">
            <h2 className="text-3xl font-serif font-bold mb-4">
              {isLogin ? "Chào mừng trở lại!" : "Gia nhập Tâm An Tea"}
            </h2>
            <p className="text-gray-100 text-lg">
              Thưởng thức hương vị bình yên trong từng tách trà.
            </p>
          </div>
        </div>

        {/* Cột Phải: Form */}
        <div className="w-full md:w-1/2 p-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            {isLogin ? "Đăng Nhập" : "Tạo Tài Khoản"}
          </h2>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-center text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name}
                  onChange={handleChange}
                  required 
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition" 
                  placeholder="Nguyễn Văn A" 
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                required 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition" 
                placeholder="admin@gmail.com" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                required 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 outline-none transition" 
                placeholder="••••••••" 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className={`w-full text-white font-bold py-3 rounded-xl transition shadow-lg transform active:scale-95 ${
                loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-700 hover:bg-green-800 shadow-green-700/30'
              }`}
            >
              {loading ? "Đang xử lý..." : (isLogin ? "Đăng Nhập" : "Đăng Ký Ngay")}
            </button>
          </form>

          <div className="mt-8 text-center border-t pt-6">
            <p className="text-gray-600 text-sm">
              {isLogin ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
              <button 
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(''); 
                }} 
                className="text-green-700 font-bold hover:underline ml-1 transition"
              >
                {isLogin ? "Đăng ký ngay" : "Đăng nhập"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;