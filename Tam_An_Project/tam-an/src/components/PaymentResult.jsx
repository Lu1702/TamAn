import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const PaymentResult = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('loading'); // loading | success | error
  const [message, setMessage] = useState('Đang xử lý kết quả thanh toán...');
  
  // Dùng useRef để chắn việc React.StrictMode chạy useEffect 2 lần (gây trùng đơn hàng)
  const isProcessed = useRef(false);

  useEffect(() => {
    if (isProcessed.current) return;
    isProcessed.current = true;

    const code = searchParams.get('vnp_ResponseCode');
    
    // 1. KIỂM TRA MÃ KẾT QUẢ TỪ VNPAY
    if (code === '00') {
      // --- THANH TOÁN THÀNH CÔNG ---
      handleSaveOrder();
    } else {
      // --- THANH TOÁN THẤT BẠI / HỦY ---
      setStatus('error');
      setMessage('Giao dịch thất bại hoặc đã bị hủy.');
    }
  }, []);

  const handleSaveOrder = async () => {
    // Lấy thông tin đơn hàng tạm đã lưu lúc bấm Checkout
    const pendingOrder = JSON.parse(localStorage.getItem('pending_order'));

    if (!pendingOrder) {
      setStatus('error');
      setMessage('Không tìm thấy thông tin đơn hàng tạm thời.');
      return;
    }

    // Bổ sung thông tin thanh toán
    const finalOrderData = {
      ...pendingOrder,
      payment_method: 'VNPAY',
      payment_status: 'PAID', // Đánh dấu đã trả tiền
      transaction_id: searchParams.get('vnp_TxnRef') // Mã giao dịch VNPay
    };

    try {
      // Gọi API lưu đơn hàng vào SQL Server
      const res = await fetch('http://localhost:5000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalOrderData)
      });

      if (res.ok) {
        setStatus('success');
        setMessage('Thanh toán thành công! Đơn hàng đã được ghi nhận.');
        
        // Dọn dẹp giỏ hàng
        localStorage.removeItem('cart');
        localStorage.removeItem('pending_order');
        window.dispatchEvent(new Event("storage")); // Cập nhật icon giỏ hàng
      } else {
        setStatus('error');
        setMessage('Thanh toán thành công nhưng lỗi khi lưu đơn hàng. Vui lòng liên hệ Admin.');
      }
    } catch (err) {
      console.error(err);
      setStatus('error');
      setMessage('Lỗi kết nối tới máy chủ.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
        
        {status === 'loading' && (
          <div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-700 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-700">{message}</h2>
          </div>
        )}

        {status === 'success' && (
          <div>
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">Thanh toán thành công!</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <button 
              onClick={() => navigate('/')}
              className="w-full bg-green-700 text-white py-3 rounded-lg font-bold hover:bg-green-800 transition">
              Về trang chủ
            </button>
          </div>
        )}

        {status === 'error' && (
          <div>
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-800 mb-2">Thanh toán thất bại</h2>
            <p className="text-gray-600 mb-6">{message}</p>
            <div className="flex gap-2">
              <button 
                onClick={() => navigate('/checkout')}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-bold hover:bg-gray-300 transition">
                Thử lại
              </button>
              <button 
                onClick={() => navigate('/')}
                className="flex-1 bg-green-700 text-white py-3 rounded-lg font-bold hover:bg-green-800 transition">
                Về trang chủ
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PaymentResult;