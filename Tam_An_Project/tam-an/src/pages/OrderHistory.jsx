import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/history', {
          method: 'GET',
          credentials: 'include' 
        });

        if (res.status === 401 || res.status === 403) {
          alert("Phiên đăng nhập hết hạn!");
          navigate('/login');
          return;
        }

        const data = await res.json();
        setOrders(data);
      } catch (err) {
        console.error("Lỗi:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [navigate]);

  if (loading) return <div className="text-center mt-10">Đang tải lịch sử...</div>;

  return (
    // --- 1. THẺ DIV BAO NGOÀI ĐỂ CHỨA BACKGROUND ---
    <div 
      className="min-h-screen bg-cover bg-center bg-fixed"
      style={{ 
        backgroundImage: "url('/images/background.jpg')", // Đường dẫn ảnh từ public
      }}
    >
      {/* --- 2. LỚP PHỦ MỜ (Overlay) ĐỂ DỄ ĐỌC CHỮ --- */}
      <div className="min-h-screen bg-white/80 py-8"> 
        
        {/* --- 3. CONTAINER NỘI DUNG CŨ --- */}
        <div className="max-w-4xl mx-auto p-6">
          <h2 className="text-3xl font-bold text-green-800 mb-6 border-b border-green-800 pb-2">
            Lịch Sử Đơn Hàng
          </h2>
          
          {orders.length === 0 ? (
            <div className="text-center text-gray-600 font-medium py-10 bg-white rounded-lg shadow">
              Bạn chưa có đơn hàng nào.
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
                  {/* Header đơn hàng */}
                  <div className="bg-gray-50 p-4 flex flex-wrap justify-between items-center border-b">
                    <div>
                      <span className="font-bold text-gray-700">Đơn hàng #{order.id}</span>
                      <span className="text-sm text-gray-500 ml-3">
                        {new Date(order.order_date).toLocaleString('vi-VN')}
                      </span>
                    </div>
                    <div className="flex gap-2 mt-2 sm:mt-0">
                       {/* Badge trạng thái thanh toán */}
                       {order.payment_status === 'PAID' ? (
                          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold border border-green-200">
                            ✅ Đã thanh toán
                          </span>
                       ) : (
                          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold border border-yellow-200">
                            ⏳ Chưa thanh toán
                          </span>
                       )}
                       
                       {/* Badge phương thức */}
                       <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100">
                         {order.payment_method}
                       </span>
                    </div>
                  </div>

                  {/* Chi tiết sản phẩm */}
                  <div className="p-4">
                    {(() => {
                        try {
                            const items = JSON.parse(order.items_json);
                            return items.map((item, idx) => (
                                <div key={idx} className="flex justify-between items-center py-2 border-b last:border-0 border-dashed border-gray-200">
                                  <div className="flex items-center gap-3">
                                     <img src={item.img || 'https://via.placeholder.com/50'} className="w-12 h-12 rounded object-cover border" alt="" />
                                     <div>
                                        <p className="font-medium text-gray-800">{item.name}</p>
                                        <p className="text-xs text-gray-500">x{item.quantity}</p>
                                     </div>
                                  </div>
                                  <span className="text-gray-600 font-medium">
                                    {(item.price * item.quantity).toLocaleString()} đ
                                  </span>
                                </div>
                            ));
                        } catch (e) {
                            return <p className="text-red-500">Lỗi hiển thị sản phẩm</p>;
                        }
                    })()}
                  </div>

                  {/* Footer tổng tiền */}
                  <div className="bg-green-50 p-4 flex justify-between items-center text-green-900 font-bold border-t">
                     <span>Tổng cộng:</span>
                     <span className="text-xl">{order.total_price.toLocaleString()} đ</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;