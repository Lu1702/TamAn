import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true); // Toggle Login/Register
  const [error, setError] = useState(''); // State để hiển thị lỗi
  const [loading, setLoading] = useState(false); // 1. MỚI: State loading

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
    setError(''); // Reset lỗi cũ
    setLoading(true); // Bắt đầu loading

    // Xác định API cần gọi (Login hoặc Register)
    const endpoint = isLogin ? '/api/login' : '/api/register';

    try {
      const res = await fetch(`http://localhost:5000${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // 2. QUAN TRỌNG: Dòng này bắt buộc để nhận/gửi Cookie HttpOnly
        credentials: 'include', 
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        // --- 1. ĐĂNG NHẬP / ĐĂNG KÝ THÀNH CÔNG ---
        
        // Lưu thông tin user (Profile) vào LocalStorage
        // KHÔNG CẦN LƯU TOKEN VÀO ĐÂY NỮA (Nó đã nằm an toàn trong Cookie)
        localStorage.setItem('user', JSON.stringify(data.user));

        // --- 2. LOGIC GỘP GIỎ HÀNG (MERGE CART) ---
        const localCart = JSON.parse(localStorage.getItem('cart')) || [];

        if (localCart.length > 0) {
            try {
                // Dùng Promise.all để gửi nhiều sản phẩm lên server cùng lúc
                await Promise.all(localCart.map(item => {
                    return fetch('http://localhost:5000/api/cart/add', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        // Cũng cần credentials ở đây để Server biết là User nào đang gửi
                        credentials: 'include', 
                        body: JSON.stringify({
                            user_id: data.user.id,    
                            product_id: item.id,      
                            quantity: item.quantity    
                        })
                    });
                }));

                // Sau khi đẩy hết lên Server thành công thì xóa LocalStorage cho sạch
                localStorage.removeItem('cart');
                console.log("Đã đồng bộ giỏ hàng lên server!");
            } catch (err) {
                console.error("Lỗi khi đồng bộ giỏ hàng:", err);
            }
        }
        // ----------------------------------------------------
        
        // 3. Bắn tín hiệu để Navbar cập nhật số lượng mới từ Server
        window.dispatchEvent(new Event("storage"));

        alert(data.message);
        
        // 4. Điều hướng
        if (data.user.role === 'admin') {
            navigate('/admin'); 
        } else {
            navigate('/');      
        }

      } else {
        // --- THẤT BẠI ---
        setError(data.message);
      }

    } catch (err) {
      setError("Lỗi kết nối đến Server! Hãy kiểm tra backend.");
    } finally {
        setLoading(false); // Tắt loading dù thành công hay thất bại
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-cover bg-center relative"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1597481499750-3e6b22637e12?q=80&w=2070')" }}
    >
      {/* --- LỚP PHỦ MỜ 30% --- */}
      <div className="absolute inset-0 bg-black/30"></div>

      {/* Container chính của form */}
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row relative z-10">
        
        {/* Cột Trái: Hình ảnh */}
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
          <h2 className="text-3xl font-bold text-gray-800 mb-2 text-center">
            {isLogin ? "Đăng Nhập" : "Tạo Tài Khoản"}
          </h2>
          
          {/* Hiển thị lỗi nếu có */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Field Tên chỉ hiện khi Đăng ký */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Họ và tên</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name}
                  onChange={handleChange}
                  required 
                  className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500" 
                  placeholder="Nguyễn Văn A" 
                />
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                required 
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500" 
                placeholder="admin@gmail.com" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Mật khẩu</label>
              <input 
                type="password" 
                name="password"
                value={formData.password}
                onChange={handleChange}
                required 
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-green-500 focus:border-green-500" 
                placeholder="••••••••" 
              />
            </div>

            <button 
              type="submit" 
              disabled={loading} // Disable khi đang loading
              className={`w-full text-white font-bold py-3 rounded-xl transition shadow-lg ${
                loading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-700 hover:bg-green-800 shadow-green-700/30'
              }`}
            >
              {loading ? "Đang xử lý..." : (isLogin ? "Đăng Nhập" : "Đăng Ký Ngay")}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {isLogin ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
              <button 
                onClick={() => {
                  setIsLogin(!isLogin);
                  setError(''); 
                }} 
                className="text-green-700 font-bold hover:underline ml-1"
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