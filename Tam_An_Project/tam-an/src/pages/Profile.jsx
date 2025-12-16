import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  
  // State cho form sửa đổi
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  
  // State thông báo lỗi/thành công
  const [message, setMessage] = useState({ text: '', type: '' });

  // 1. Load thông tin khi vào trang
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (!storedUser) {
      navigate('/login'); // Chưa đăng nhập thì đá về trang login
    } else {
      setUser(storedUser);
      setName(storedUser.name); // Điền sẵn tên hiện tại vào ô input
    }
  }, [navigate]);

  // 2. Hàm xử lý cập nhật (ĐÃ SỬA)
  const handleUpdate = async (e) => {
    e.preventDefault();
    setMessage({ text: '', type: '' });

    if (!password) {
      setMessage({ text: 'Vui lòng nhập mật khẩu để xác nhận thay đổi!', type: 'error' });
      return;
    }

    try {
      // Gọi API update
      const res = await fetch(`http://localhost:5000/api/users/update`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        
        // --- QUAN TRỌNG: Gửi Cookie xác thực đi ---
        credentials: 'include', 
        // ------------------------------------------

        body: JSON.stringify({ 
            name: name, 
            password: password,
            email: user.email,   // Gửi email để định danh (readonly)
            address: user.address, // Gửi địa chỉ mới
            phone: user.phone      // Gửi số điện thoại mới
        })
      });

      if (res.ok) {
        // Cập nhật thành công -> Lưu lại thông tin mới vào LocalStorage
        const newUserInfo = { 
            ...user, 
            name: name,
            address: user.address, // Cập nhật luôn địa chỉ vào storage
            phone: user.phone      // Cập nhật luôn SĐT vào storage
        }; 
        
        localStorage.setItem('user', JSON.stringify(newUserInfo)); 
        setUser(newUserInfo);
        
        setMessage({ text: 'Cập nhật thành công!', type: 'success' });
        setPassword(''); // Xóa ô mật khẩu đi cho an toàn
        
        // Bắn tín hiệu để Navbar cập nhật tên mới ngay lập tức
        window.dispatchEvent(new Event("storage"));
      } else {
        const errData = await res.json();
        setMessage({ text: errData.message || 'Có lỗi xảy ra, vui lòng thử lại.', type: 'error' });
      }
    } catch (error) {
      console.error(error);
      setMessage({ text: 'Lỗi kết nối server.', type: 'error' });
    }
  };

  const handleLogout = () => {
    // Gọi API logout để xóa cookie ở server (nếu server có hỗ trợ)
    fetch('http://localhost:5000/api/logout', { method: 'POST', credentials: 'include' })
      .catch(err => console.log(err));

    localStorage.removeItem('user');
    window.dispatchEvent(new Event("storage"));
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-serif text-green-800 mb-8 font-bold border-l-4 border-green-600 pl-4">
          Hồ Sơ Cá Nhân
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* CỘT TRÁI: THẺ THÔNG TIN CỐ ĐỊNH */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 text-center border-t-4 border-green-700">
              <div className="w-32 h-32 mx-auto bg-green-100 rounded-full p-2 mb-4">
                {/* Avatar tạo tự động theo tên */}
                <img 
                  src={`https://ui-avatars.com/api/?name=${user.name}&background=15803d&color=fff&size=128`} 
                  alt="Avatar" 
                  className="w-full h-full rounded-full object-cover"
                />
              </div>
              <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
              <p className="text-gray-500 mb-2">{user.email}</p>
              
              <span className="inline-block bg-green-100 text-green-800 text-xs px-3 py-1 rounded-full uppercase font-bold">
                Thành viên {user.role === 'admin' ? 'Quản trị' : 'Thân thiết'}
              </span>

              <button 
                onClick={handleLogout}
                className="w-full mt-6 py-2 border border-red-500 text-red-500 rounded-lg hover:bg-red-50 transition font-medium"
              >
                Đăng Xuất
              </button>
            </div>
          </div>

          {/* CỘT PHẢI: FORM CẬP NHẬT */}
          <div className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-md p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-green-700">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
                Cập nhật thông tin
              </h3>

              {/* Hiển thị thông báo */}
              {message.text && (
                <div className={`p-4 mb-6 rounded-lg text-center ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleUpdate} className="space-y-6">
                {/* Email (Read only - Không cho sửa) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email (Không thể thay đổi)</label>
                  <input 
                    type="text" 
                    value={user.email} 
                    disabled 
                    className="w-full px-4 py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-500 cursor-not-allowed"
                  />
                </div>

                {/* Tên hiển thị */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Họ và tên</label>
                  <input 
                    type="text" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  />
                </div>

                {/* Số điện thoại */}
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                <input 
                    type="text" 
                    value={user.phone || ''} // Nếu chưa có thì để rỗng
                    onChange={(e) => setUser({...user, phone: e.target.value})} // Cập nhật tạm vào state user
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                />
                </div>

                {/* Địa chỉ */}
                <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ giao hàng</label>
                <input 
                    type="text" 
                    value={user.address || ''} 
                    onChange={(e) => setUser({...user, address: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                />
                </div>

                {/* Mật khẩu */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mật khẩu mới (hoặc xác nhận mật khẩu cũ)
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu để lưu thay đổi"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition"
                  />
                  <p className="text-xs text-gray-500 mt-1">Để bảo mật, bạn cần nhập mật khẩu mỗi khi muốn cập nhật thông tin.</p>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit" 
                    className="px-6 py-3 bg-green-700 text-white font-bold rounded-lg hover:bg-green-800 transition shadow-lg shadow-green-700/30"
                  >
                    Lưu Thay Đổi
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Profile;