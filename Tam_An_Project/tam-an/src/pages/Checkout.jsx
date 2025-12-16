import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  
  // State form đặt hàng
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    address: '',
    note: ''
  });

  // 1. Load giỏ hàng & Thông tin User (nếu có)
  useEffect(() => {
    // Lấy giỏ hàng
    const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCart(storedCart);

    // LOGIC TỰ ĐIỀN THÔNG TIN:
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      // Nếu đã đăng nhập -> Lấy thông tin từ user điền vào form
      setFormData({
        customer_name: storedUser.name || '',
        phone: storedUser.phone || '',
        address: storedUser.address || '',
        note: ''
      });
    }
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const handleOrder = async (e) => {
    e.preventDefault();
    
    // Chuẩn bị dữ liệu gửi lên Server
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const orderData = {
      ...formData,
      user_id: storedUser ? storedUser.id : null, // Nếu chưa login thì null
      items: cart,
      total_price: calculateTotal()
    };

    try {
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (res.ok) {
        alert("Đặt hàng thành công! Cảm ơn bạn.");
        localStorage.removeItem('cart'); // Xóa giỏ hàng
        window.dispatchEvent(new Event("storage")); // Cập nhật icon giỏ hàng
        navigate('/');
      } else {
        alert("Đặt hàng thất bại.");
      }
    } catch (err) {
      console.error(err);
      alert("Lỗi kết nối server.");
    }
  };

  if (cart.length === 0) return <div className="text-center py-20">Giỏ hàng trống!</div>;

  return (
    <div className="min-h-screen bg-stone-50 py-10 px-4">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* CỘT TRÁI: THÔNG TIN GIAO HÀNG */}
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold text-green-800 mb-4">Thông tin giao hàng</h2>
          <form onSubmit={handleOrder} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Họ và tên *</label>
              <input type="text" name="customer_name" required value={formData.customer_name} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Nhập họ tên" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Số điện thoại *</label>
              <input type="text" name="phone" required value={formData.phone} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Nhập số điện thoại" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Địa chỉ nhận hàng *</label>
              <input type="text" name="address" required value={formData.address} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Số nhà, tên đường..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Ghi chú</label>
              <textarea name="note" value={formData.note} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Ví dụ: Ít đá, nhiều đường..."></textarea>
            </div>
            
            <button type="submit" className="w-full bg-green-700 text-white py-3 rounded-lg font-bold hover:bg-green-800 transition">
              Xác Nhận Đặt Hàng ({calculateTotal().toLocaleString()} đ)
            </button>
          </form>
        </div>

        {/* CỘT PHẢI: XEM LẠI ĐƠN HÀNG */}
        <div className="bg-white p-6 rounded-xl shadow-md h-fit">
          <h2 className="text-xl font-bold text-green-800 mb-4">Đơn hàng của bạn</h2>
          <div className="space-y-4">
            {cart.map((item, index) => (
              <div key={index} className="flex justify-between items-center border-b pb-2">
                <div className="flex items-center gap-3">
                   <img src={item.img} alt={item.name} className="w-12 h-12 rounded object-cover" />
                   <div>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm text-gray-500">x{item.quantity}</p>
                   </div>
                </div>
                <p className="font-bold">{(item.price * item.quantity).toLocaleString()} đ</p>
              </div>
            ))}
            <div className="flex justify-between pt-2 text-xl font-bold text-green-700">
              <span>Tổng cộng:</span>
              <span>{calculateTotal().toLocaleString()} đ</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;