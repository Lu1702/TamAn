import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // State cho Voucher
  const [voucherCode, setVoucherCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0); // % giảm giá

  const user = JSON.parse(localStorage.getItem('user'));

  // --- LOGIC 1: LẤY DỮ LIỆU GIỎ HÀNG ---
  const fetchCart = () => {
    if (user) {
      // TRƯỜNG HỢP 1: ĐÃ ĐĂNG NHẬP -> GỌI API KÈM COOKIE
      setLoading(true);
      fetch(`http://localhost:5000/api/cart/${user.id}`, { 
          credentials: 'include' // QUAN TRỌNG: Gửi cookie đi
      })
        .then(res => res.json())
        .then(data => {
          const formattedCart = data.map(item => ({
            id: item.product_id, 
            name: item.name,
            price: item.price,
            img: item.img,
            quantity: item.quantity
          }));
          setCartItems(formattedCart);
          setLoading(false);
        })
        .catch(err => {
          console.error("Lỗi tải giỏ hàng:", err);
          setLoading(false);
        });
    } else {
      // TRƯỜNG HỢP 2: KHÁCH VÃNG LAI -> LOCALSTORAGE
      const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
      setCartItems(savedCart);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  // --- LOGIC 2: XÓA SẢN PHẨM ---
  const removeItem = (productId) => {
    if (user) {
      // Xóa trên Server
      fetch(`http://localhost:5000/api/cart/remove/${user.id}/${productId}`, {
        method: 'DELETE',
        credentials: 'include' // QUAN TRỌNG
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setCartItems(cartItems.filter(item => item.id !== productId));
          window.dispatchEvent(new Event("storage")); 
        }
      });
    } else {
      // Xóa trên LocalStorage
      const newCart = cartItems.filter(item => item.id !== productId);
      setCartItems(newCart); 
      localStorage.setItem('cart', JSON.stringify(newCart)); 
      window.dispatchEvent(new Event("storage")); 
    }
  };

  // --- LOGIC 3: ÁP DỤNG VOUCHER ---
  const handleApplyVoucher = async () => {
      if (!voucherCode) return alert("Vui lòng nhập mã!");
      
      try {
          const res = await fetch('http://localhost:5000/api/voucher/apply', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ code: voucherCode }),
              credentials: 'include' // QUAN TRỌNG: Để check user sở hữu voucher
          });
          const data = await res.json();
          
          if (data.success) {
              setDiscountPercent(data.discount);
              alert(`Thành công! Bạn được giảm ${data.discount}%`);
          } else {
              setDiscountPercent(0);
              alert(data.message);
          }
      } catch (err) {
          alert("Lỗi kết nối khi kiểm tra mã");
      }
  };

  // --- LOGIC 4: TÍNH TOÁN TIỀN ---
  const totalAmount = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const discountAmount = totalAmount * (discountPercent / 100);
  const finalAmount = totalAmount - discountAmount;

  // --- LOGIC 5: THANH TOÁN (Gửi kèm thông tin voucher sang Checkout) ---
  const handleCheckout = () => {
      navigate('/checkout', { 
          state: { 
              voucherCode, 
              discountPercent, 
              finalAmount,
              items: cartItems 
          } 
      });
  };

  if (loading) return <div className="text-center py-20">Đang tải giỏ hàng...</div>;

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
                <img 
                    src={item.img || 'https://via.placeholder.com/150'} 
                    alt={item.name} 
                    className="w-20 h-20 object-cover rounded-lg border border-gray-100" 
                />
                <div className="ml-4 flex-1">
                  <h3 className="font-semibold text-gray-800 text-lg">{item.name}</h3>
                  <p className="text-gray-500 text-sm">{Number(item.price).toLocaleString('vi-VN')} đ</p>
                </div>
                <div className="text-center mx-4">
                    <span className="block text-xs text-gray-400 mb-1">Số lượng</span>
                    <span className="font-bold text-gray-800 bg-white border px-3 py-1 rounded-md">{item.quantity}</span>
                </div>
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
            
            {/* --- Ô NHẬP VOUCHER MỚI --- */}
            <div className="mb-6">
                <label className="text-sm text-gray-600 mb-1 block font-medium">Mã ưu đãi (Nếu có):</label>
                <div className="flex gap-2">
                    <input 
                        type="text" 
                        value={voucherCode}
                        onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                        placeholder="VD: X9A2B1"
                        className="flex-1 p-2 border rounded border-gray-300 uppercase font-mono text-sm focus:outline-none focus:ring-1 focus:ring-green-500"
                    />
                    <button 
                        onClick={handleApplyVoucher}
                        className="bg-gray-800 text-white px-4 rounded hover:bg-black text-sm transition"
                    >
                        Áp dụng
                    </button>
                </div>
                {/* Chỉ hiện dòng này nếu đang dùng LocalStorage */}
                {!user && <p className="text-xs text-red-500 mt-1">* Vui lòng đăng nhập để sử dụng mã.</p>}
            </div>
            {/* --------------------------- */}

            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Tạm tính:</span>
                <span>{totalAmount.toLocaleString('vi-VN')} đ</span>
              </div>
              
              {/* Hiển thị dòng giảm giá nếu có */}
              {discountPercent > 0 && (
                  <div className="flex justify-between text-green-600 font-bold">
                    <span>Voucher (-{discountPercent}%):</span>
                    <span>-{(totalAmount * discountPercent / 100).toLocaleString('vi-VN')} đ</span>
                  </div>
              )}

              <div className="flex justify-between text-gray-600">
                <span>Phí vận chuyển:</span>
                <span className="text-green-600 font-medium">Miễn phí</span>
              </div>
              
              <div className="border-t pt-3 flex justify-between items-center">
                <span className="font-bold text-lg text-gray-800">Tổng cộng:</span>
                <span className="font-bold text-2xl text-green-700">{finalAmount.toLocaleString('vi-VN')} đ</span>
              </div>
            </div>
            
            <button 
              onClick={handleCheckout}
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