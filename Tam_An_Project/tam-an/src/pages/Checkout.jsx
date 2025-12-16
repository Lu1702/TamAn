import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation(); // Hứng dữ liệu từ trang Cart
  
  const [cart, setCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('COD');

  // State lưu thông tin giảm giá (nếu có)
  const [discountInfo, setDiscountInfo] = useState({
    code: '',
    percent: 0,
    discountAmount: 0,
    finalAmount: 0
  });

  // State form đặt hàng
  const [formData, setFormData] = useState({
    customer_name: '',
    phone: '',
    address: '',
    note: ''
  });

  // 1. Load dữ liệu khi vào trang
  useEffect(() => {
    // ƯU TIÊN 1: Lấy dữ liệu từ trang Cart gửi sang (thông qua navigate state)
    if (location.state && location.state.items) {
      setCart(location.state.items);

      // Nếu bên Cart có áp mã giảm giá, lưu lại vào state
      if (location.state.discountPercent > 0) {
        const rawTotal = location.state.items.reduce((total, item) => total + item.price * item.quantity, 0);
        const discountAmt = rawTotal * (location.state.discountPercent / 100);
        
        setDiscountInfo({
          code: location.state.voucherCode,
          percent: location.state.discountPercent,
          discountAmount: discountAmt,
          finalAmount: location.state.finalAmount
        });
      }
    } 
    // ƯU TIÊN 2: Nếu không có (ví dụ F5 lại trang), tìm trong LocalStorage (cho khách vãng lai)
    else {
      const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
      setCart(storedCart);
    }

    // Tự động điền thông tin User nếu đã đăng nhập
    const storedUser = JSON.parse(localStorage.getItem('user'));
    if (storedUser) {
      setFormData({
        customer_name: storedUser.name || '',
        phone: storedUser.phone || '',
        address: storedUser.address || '',
        note: ''
      });
    }
  }, [location]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Tính tổng tiền gốc (chưa giảm giá)
  const calculateSubTotal = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // Tính tổng tiền cần thanh toán (Final Price)
  const calculateFinalTotal = () => {
    if (discountInfo.finalAmount > 0) {
      return discountInfo.finalAmount;
    }
    return calculateSubTotal();
  };

  const handleOrder = async (e) => {
    e.preventDefault();
    const finalTotal = calculateFinalTotal();

    // Chuẩn bị dữ liệu đơn hàng chung
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const baseOrderData = {
      ...formData,
      user_id: storedUser ? storedUser.id : null,
      items: cart,
      total_price: finalTotal,
      voucher_code: discountInfo.code || null, // Lưu mã voucher nếu có
      discount_amount: discountInfo.discountAmount || 0
    };

    // --- TRƯỜNG HỢP 1: THANH TOÁN VNPAY ---
    if (paymentMethod === 'VNPAY') {
      try {
        const res = await fetch('http://localhost:5000/api/create_payment_url', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: finalTotal, // Gửi số tiền ĐÃ GIẢM GIÁ
            bankCode: 'NCB',
            language: 'vn'
          })
        });

        const data = await res.json();
        if (data.code === '00') {
            // Lưu tạm đơn hàng để PaymentResult xử lý sau khi thanh toán xong
            localStorage.setItem('pending_order', JSON.stringify(baseOrderData));

            // Chuyển hướng sang VNPay
            window.location.href = data.data; 
        } else {
            alert("Lỗi tạo link thanh toán VNPay");
        }
      } catch (err) {
        console.error(err);
        alert("Lỗi kết nối server VNPay");
      }
      return; 
    }

    // --- TRƯỜNG HỢP 2: THANH TOÁN KHI NHẬN HÀNG (COD) ---
    try {
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...baseOrderData,
          payment_method: 'COD'
        })
      });

      if (res.ok) {
        alert("Đặt hàng thành công! Cảm ơn bạn.");
        
        // Xóa giỏ hàng phù hợp (API hoặc LocalStorage)
        if (!storedUser) {
           localStorage.removeItem('cart');
        }
        // Nếu dùng API thì backend tự xóa cart, ở đây chỉ cần xóa state frontend
        window.dispatchEvent(new Event("storage"));
        
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
              <input type="text" name="phone" required value={formData.phone} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Nhập sđt" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Địa chỉ nhận hàng *</label>
              <input type="text" name="address" required value={formData.address} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Số nhà, đường..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Ghi chú</label>
              <textarea name="note" value={formData.note} onChange={handleChange} className="w-full border p-2 rounded" placeholder="Ghi chú thêm..."></textarea>
            </div>

            {/* --- PHẦN CHỌN PHƯƠNG THỨC THANH TOÁN --- */}
            <div className="mt-6 border-t pt-4">
                <label className="block text-sm font-bold text-gray-800 mb-3">Phương thức thanh toán</label>
                <div className="flex flex-col gap-3">
                    <label className={`flex items-center gap-3 border p-3 rounded-lg cursor-pointer transition ${paymentMethod === 'COD' ? 'border-green-600 bg-green-50' : 'hover:bg-gray-50'}`}>
                        <input 
                            type="radio" 
                            name="payment" 
                            value="COD" 
                            checked={paymentMethod === 'COD'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="text-green-600 focus:ring-green-500"
                        />
                        <span className="font-medium">Thanh toán khi nhận hàng (COD)</span>
                    </label>

                    <label className={`flex items-center gap-3 border p-3 rounded-lg cursor-pointer transition ${paymentMethod === 'VNPAY' ? 'border-green-600 bg-green-50' : 'hover:bg-gray-50'}`}>
                        <input 
                            type="radio" 
                            name="payment" 
                            value="VNPAY" 
                            checked={paymentMethod === 'VNPAY'}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="text-green-600 focus:ring-green-500"
                        />
                        <div className="flex items-center gap-2">
                            <span className="font-medium">Thanh toán qua Ví VNPAY</span>
                            <img src="https://vinadesign.vn/uploads/images/2023/05/vnpay-logo-vinadesign-25-12-57-55.jpg" alt="VNPAY" className="h-5" />
                        </div>
                    </label>
                </div>
            </div>

            <button type="submit" className="w-full bg-green-700 text-white py-3 rounded-lg font-bold hover:bg-green-800 transition mt-6 shadow-lg shadow-green-700/30">
              {paymentMethod === 'VNPAY' ? 'Tiếp tục thanh toán VNPay' : `Xác Nhận Đặt Hàng (${calculateFinalTotal().toLocaleString()} đ)`}
            </button>
          </form>
        </div>

        {/* CỘT PHẢI: XEM LẠI ĐƠN HÀNG */}
        <div className="bg-white p-6 rounded-xl shadow-md h-fit sticky top-4">
          <h2 className="text-xl font-bold text-green-800 mb-4 border-b pb-2">Đơn hàng của bạn</h2>
          <div className="space-y-4">
            {cart.map((item, index) => (
              <div key={index} className="flex justify-between items-center border-b border-dashed pb-3 last:border-0">
                <div className="flex items-center gap-3">
                   <div className="relative">
                     <img src={item.img || 'https://via.placeholder.com/50'} alt={item.name} className="w-14 h-14 rounded-md object-cover border" />
                     <span className="absolute -top-2 -right-2 bg-gray-500 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">{item.quantity}</span>
                   </div>
                   <div>
                      <p className="font-medium text-sm text-gray-800 line-clamp-1 w-32">{item.name}</p>
                   </div>
                </div>
                <p className="font-bold text-gray-700">{(item.price * item.quantity).toLocaleString()} đ</p>
              </div>
            ))}
            
            <div className="pt-4 space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                    <span>Tạm tính:</span>
                    <span>{calculateSubTotal().toLocaleString()} đ</span>
                </div>
                
                {/* Hiển thị giảm giá nếu có */}
                {discountInfo.percent > 0 && (
                    <div className="flex justify-between text-green-600 font-medium">
                        <span>Mã giảm giá ({discountInfo.code}):</span>
                        <span>- {discountInfo.discountAmount.toLocaleString()} đ</span>
                    </div>
                )}

                <div className="flex justify-between border-t pt-3 mt-2 text-xl font-bold text-green-800">
                    <span>Tổng cộng:</span>
                    <span>{calculateFinalTotal().toLocaleString()} đ</span>
                </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;