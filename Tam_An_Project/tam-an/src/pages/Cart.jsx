import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom'; // 1. Import useNavigate

const Cart = () => {
  const navigate = useNavigate(); // 2. Khởi tạo hook điều hướng
  const [cartItems, setCartItems] = useState([]);

  // --- LOGIC 1: LẤY DỮ LIỆU KHI VÀO TRANG ---
  useEffect(() => {
    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCartItems(savedCart);
  }, []);

  // --- LOGIC 2: TÍNH TỔNG TIỀN ---
  const totalAmount = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  // --- LOGIC 3: XÓA SẢN PHẨM ---
  const removeItem = (id) => {
    const newCart = cartItems.filter(item => item.id !== id);
    setCartItems(newCart); 
    localStorage.setItem('cart', JSON.stringify(newCart)); 
    window.dispatchEvent(new Event("storage")); 
  };

  // Nếu giỏ hàng trống
  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h2 className="text-3xl font-serif font-bold text-gray-800 mb-4">Giỏ hàng trống</h2>
        <p className="text-gray-500 mb-8">Bạn chưa thêm sản phẩm nào vào giỏ hàng.</p>
        <Link to="/shop" className="px-6 py-3 bg-green-700 text-white rounded-lg hover:bg-green-800 transition">
          Quay lại cửa hàng
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold font-serif mb-8 text-center text-green-900">Giỏ Hàng Của Bạn</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cột trái: Danh sách sản phẩm */}
        <div className="w-full lg:w-2/3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center p-4 border-b last:border-b-0 hover:bg-gray-50 transition">
                
                {/* --- SỬA Ở ĐÂY: Dùng item.img (khớp với server) --- */}
                {/* Thêm fallback item.image phòng hờ dữ liệu cũ */}
                <img 
                    src={item.img || item.image || 'https://via.placeholder.com/150'} 
                    alt={item.name} 
                    className="w-20 h-20 object-cover rounded-lg border border-gray-100" 
                />
                
                {/* Tên & Giá */}
                <div className="ml-4 flex-1">
                  <h3 className="font-semibold text-gray-800 text-lg">{item.name}</h3>
                  <p className="text-gray-500 text-sm">{Number(item.price).toLocaleString('vi-VN')} đ</p>
                </div>

                {/* Số lượng */}
                <div className="text-center mx-4">
                    <span className="block text-xs text-gray-400 mb-1">Số lượng</span>
                    <span className="font-bold text-gray-800 bg-white border px-3 py-1 rounded-md">{item.quantity}</span>
                </div>

                {/* Nút Xóa */}
                <button 
                  onClick={() => removeItem(item.id)}
                  className="text-red-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-full transition"
                  title="Xóa sản phẩm"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Cột phải: Tổng tiền & Thanh toán */}
        <div className="w-full lg:w-1/3">
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 sticky top-24">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Tổng Đơn Hàng</h3>
            
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính:</span>
                <span>{totalAmount.toLocaleString('vi-VN')} đ</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển:</span>
                <span className="text-green-600 font-medium">Miễn phí</span>
              </div>
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="font-bold text-lg text-gray-800">Tổng cộng:</span>
                <span className="font-bold text-2xl text-green-700">{totalAmount.toLocaleString('vi-VN')} đ</span>
              </div>
            </div>
            
            {/* --- SỬA Ở ĐÂY: Chuyển hướng sang trang Checkout --- */}
            <button 
              onClick={() => navigate('/checkout')}
              className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-xl font-bold transition shadow-lg shadow-green-700/30 active:scale-95"
            >
              Thanh Toán Ngay
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;