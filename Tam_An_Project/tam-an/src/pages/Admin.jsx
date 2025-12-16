// src/pages/Admin.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');

  // --- 1. LOGIC SẢN PHẨM ---
  const [products, setProducts] = useState([]);
  const [productForm, setProductForm] = useState({ name: '', price: '', desc: '', category: '', stock: '' });
  const [imageFile, setImageFile] = useState(null);

  // --- 2. LOGIC ĐƠN HÀNG ---
  const [orders, setOrders] = useState([]);

  // --- 3. LOGIC KHUYẾN MÃI (VÒNG QUAY) ---
  const [promotions, setPromotions] = useState([]);
  const [promoForm, setPromoForm] = useState({ label: '', value: '', color: '#ff0000', percentage: '' });

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
        alert("Bạn không có quyền truy cập!");
        navigate('/');
        return;
    }
    fetchProducts();
    fetchOrders();
    fetchPromotions();
  }, [navigate]);

  // --- CÁC HÀM FETCH DỮ LIỆU ---
  const fetchProducts = async () => {
    try {
        const res = await fetch('http://localhost:5000/api/products');
        setProducts(await res.json());
    } catch (error) { console.error(error); }
  };

  const fetchOrders = async () => {
    try {
        const res = await fetch('http://localhost:5000/api/orders', { credentials: 'include' });
        if (res.ok) setOrders(await res.json());
    } catch (error) { console.error(error); }
  };

  const fetchPromotions = async () => {
    try {
        const res = await fetch('http://localhost:5000/api/promotions');
        setPromotions(await res.json());
    } catch (error) { console.error(error); }
  };

  // --- HANDLERS SẢN PHẨM ---
  const handleProductChange = (e) => setProductForm({ ...productForm, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setImageFile(e.target.files[0]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(productForm).forEach(key => data.append(key, productForm[key]));
    if (imageFile) data.append('image', imageFile);

    const res = await fetch('http://localhost:5000/api/products', { 
        method: 'POST', 
        body: data,
        credentials: 'include' 
    });
    if (res.ok) {
        alert("Thêm món thành công!");
        fetchProducts();
        setProductForm({ name: '', price: '', desc: '', category: '', stock: '' });
        setImageFile(null);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Xóa nhé?")) {
        await fetch(`http://localhost:5000/api/products/${id}`, { 
            method: 'DELETE',
            credentials: 'include'
        });
        fetchProducts();
    }
  };

  // --- HANDLERS ĐƠN HÀNG (MỚI THÊM) ---
  const handleMarkAsDone = async (orderId) => {
    if (!window.confirm("Xác nhận đơn hàng này đã thanh toán/hoàn thành?")) return;

    try {
        const res = await fetch(`http://localhost:5000/api/orderdone`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // Gửi cookie admin
            body: JSON.stringify({ 
            id: orderId
        })
        });

        if (res.ok) {
            alert("Đã cập nhật trạng thái đơn hàng!");
            fetchOrders(); // Load lại danh sách để thấy thay đổi
        } else {
            alert("Lỗi khi cập nhật");
        }
    } catch (error) {
        console.error(error);
        alert("Lỗi kết nối server");
    }
  };

  // --- HANDLERS KHUYẾN MÃI ---
  const handlePromoChange = (e) => setPromoForm({ ...promoForm, [e.target.name]: e.target.value });
  
  const handleAddPromo = async (e) => {
    e.preventDefault();
    try {
        const res = await fetch('http://localhost:5000/api/promotions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(promoForm)
        });
        if (res.ok) {
            alert("Thêm ô phần thưởng thành công!");
            fetchPromotions();
            setPromoForm({ label: '', value: '', color: '#ff0000', percentage: '' });
        }
    } catch (error) { console.error(error); }
  };

  const handleDeletePromo = async (id) => {
    if (window.confirm("Xóa ô này khỏi vòng quay?")) {
        try {
            await fetch(`http://localhost:5000/api/promotions/${id}`, { 
                method: 'DELETE',
                credentials: 'include'
            });
            fetchPromotions();
        } catch (error) { console.error(error); }
    }
  };

  return (
    <div 
      className="min-h-screen flex bg-cover bg-center relative"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1597481499750-3e6b22637e12?q=80&w=2070')" }}
    >
      <div className="absolute inset-0 bg-white/90 z-0"></div>

      {/* --- SIDEBAR --- */}
      <div className="w-64 bg-green-900 text-white flex flex-col fixed h-full z-10 shadow-2xl">
        <div className="p-6 text-2xl font-bold font-serif border-b border-green-800 flex items-center gap-2">
            <span>🛡️ Admin</span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => setActiveTab('products')}
            className={`w-full text-left py-3 px-4 rounded transition flex items-center gap-3 ${activeTab === 'products' ? 'bg-green-700 font-bold shadow-lg' : 'hover:bg-green-800'}`}
          >
            📦 <span>Sản Phẩm</span>
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            className={`w-full text-left py-3 px-4 rounded transition flex items-center gap-3 ${activeTab === 'orders' ? 'bg-green-700 font-bold shadow-lg' : 'hover:bg-green-800'}`}
          >
            🛒 <span>Đơn Hàng</span>
          </button>
          <button 
            onClick={() => setActiveTab('promotions')}
            className={`w-full text-left py-3 px-4 rounded transition flex items-center gap-3 ${activeTab === 'promotions' ? 'bg-green-700 font-bold shadow-lg' : 'hover:bg-green-800'}`}
          >
            🎡 <span>Vòng Quay</span>
          </button>
        </nav>
        <div className="p-4 border-t border-green-800">
            <button onClick={() => navigate('/')} className="text-gray-300 hover:text-white text-sm flex items-center gap-2">
                ⬅ Quay về Web
            </button>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      <div className="flex-1 ml-64 p-8 relative z-10">
        
        {/* VIEW 1: QUẢN LÝ SẢN PHẨM */}
        {activeTab === 'products' && (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold mb-6 text-green-800 font-serif border-b-2 border-green-200 pb-2 inline-block">Quản Lý Sản Phẩm</h1>
            
            {/* Form thêm mới */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-green-100 mb-8">
              <h3 className="text-lg font-bold mb-4 text-green-900">Thêm Món Mới</h3>
              <form onSubmit={handleAddProduct} className="grid grid-cols-2 gap-6">
                <input className="p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" name="name" placeholder="Tên món" value={productForm.name} onChange={handleProductChange} required />
                <input className="p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" name="price" type="number" placeholder="Giá bán" value={productForm.price} onChange={handleProductChange} required />
                <input className="p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" name="category" placeholder="Danh mục (VD: Trà Xanh)" value={productForm.category} onChange={handleProductChange} />
                <input className="p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" name="stock" type="number" placeholder="Số lượng kho" value={productForm.stock} onChange={handleProductChange} />
                <textarea className="p-3 border rounded-lg col-span-2 focus:ring-2 focus:ring-green-500 outline-none" name="desc" placeholder="Mô tả chi tiết sản phẩm..." rows="3" value={productForm.desc} onChange={handleProductChange}></textarea>
                
                <div className="col-span-2">
                    <label className="block text-sm font-bold mb-2 text-gray-700">Ảnh minh họa:</label>
                    <input type="file" onChange={handleFileChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-100 file:text-green-700 hover:file:bg-green-200 cursor-pointer"/>
                </div>
                
                <button type="submit" className="col-span-2 bg-green-700 text-white py-3 rounded-lg hover:bg-green-800 font-bold shadow-md transition transform active:scale-95">
                    + Thêm Sản Phẩm Ngay
                </button>
              </form>
            </div>

            {/* Bảng sản phẩm */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                <table className="min-w-full">
                    <thead className="bg-green-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-green-800 uppercase tracking-wider">Hình ảnh</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-green-800 uppercase tracking-wider">Tên Món</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-green-800 uppercase tracking-wider">Giá</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-green-800 uppercase tracking-wider">Kho</th>
                            <th className="px-6 py-4 text-right text-xs font-bold text-green-800 uppercase tracking-wider">Hành động</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {products.map(p => (
                            <tr key={p.id} className="hover:bg-gray-50 transition">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <img src={p.img} alt="" className="h-12 w-12 rounded-lg object-cover border border-gray-200 shadow-sm"/>
                                </td>
                                <td className="px-6 py-4 font-medium text-gray-900">{p.name}</td>
                                <td className="px-6 py-4 text-green-700 font-bold">{Number(p.price).toLocaleString()} đ</td>
                                <td className="px-6 py-4 text-gray-500">{p.stock}</td>
                                <td className="px-6 py-4 text-right">
                                    <button onClick={() => handleDeleteProduct(p.id)} className="bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1 rounded-md text-sm font-medium transition">
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
          </div>
        )}

        {/* VIEW 2: QUẢN LÝ ĐƠN HÀNG (ĐÃ SỬA: THÊM NÚT DUYỆT) */}
        {activeTab === 'orders' && (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold mb-6 text-green-800 font-serif border-b-2 border-green-200 pb-2 inline-block">Danh Sách Đơn Hàng</h1>
            <div className="bg-white rounded-xl shadow-lg overflow-x-auto border border-gray-200">
              <table className="min-w-full">
                <thead className="bg-green-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-green-800 uppercase">Mã Đơn</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-green-800 uppercase">Khách Hàng</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-green-800 uppercase">Chi Tiết Món</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-green-800 uppercase">Tổng Tiền</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-green-800 uppercase">Trạng Thái</th>
                    <th className="px-6 py-4 text-center text-xs font-bold text-green-800 uppercase">Hành Động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {orders.map(order => {
                    let items = [];
                    try { items = JSON.parse(order.items_json); } catch (e) {}
                    return (
                      <tr key={order.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4 font-bold text-green-700">#{order.id}</td>
                        <td className="px-6 py-4">
                            <div className="font-bold text-gray-900">{order.customer_name}</div>
                            <div className="text-gray-500 text-xs mt-0.5">{order.phone}</div>
                            <div className="text-gray-400 text-xs italic">{order.address}</div>
                            {order.note && <div className="text-red-500 text-xs mt-1 bg-red-50 p-1 rounded inline-block">Ghi chú: {order.note}</div>}
                        </td>
                        <td className="px-6 py-4">
                            <ul className="list-disc list-inside space-y-1">
                                {items.map((item, idx) => (
                                    <li key={idx} className="text-gray-700">
                                        <span className="font-medium">{item.name}</span> <span className="text-gray-400 text-xs">x{item.quantity}</span>
                                    </li>
                                ))}
                            </ul>
                        </td>
                        <td className="px-6 py-4 font-bold text-green-800 text-base">
                            {Number(order.total_price).toLocaleString()} đ
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col gap-1">
                            <span className="px-2 py-1 rounded text-xs font-bold bg-gray-100 w-fit">
                                {order.payment_method}
                            </span>
                            {order.payment_status === 'PAID' ? (
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-bold border border-green-200 w-fit">
                                    ✅ Đã thanh toán
                                </span>
                            ) : (
                                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-bold border border-yellow-200 w-fit">
                                    ⏳ Chưa thanh toán
                                </span>
                            )}
                          </div>
                        </td>
                        
                        {/* --- CỘT HÀNH ĐỘNG (Nút Duyệt) --- */}
                        <td className="px-6 py-4 text-center">
                            {order.payment_status !== 'PAID' && (
                                <button 
                                    onClick={() => handleMarkAsDone(order.id)}
                                    className="bg-green-600 text-white px-3 py-1.5 rounded shadow hover:bg-green-700 transition text-xs font-bold flex items-center gap-1 mx-auto"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
                                    </svg>
                                    Duyệt Đơn
                                </button>
                            )}
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 3: CÀI ĐẶT VÒNG QUAY */}
        {activeTab === 'promotions' && (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold mb-6 text-green-800 font-serif border-b-2 border-green-200 pb-2 inline-block">Cài Đặt Vòng Quay</h1>
            
            {/* Form thêm ô vòng quay */}
            <div className="bg-white/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-green-100 mb-8 max-w-3xl">
              <h3 className="text-lg font-bold mb-4 text-green-900">Thêm Ô Quà Tặng & Cấu Hình Tỷ Lệ</h3>
              <form onSubmit={handleAddPromo} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input className="p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" name="label" placeholder="Tên hiển thị (VD: Giảm 20%)" value={promoForm.label} onChange={handlePromoChange} required />
                <input className="p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" name="value" type="number" placeholder="Giá trị giảm (VD: 20)" value={promoForm.value} onChange={handlePromoChange} required />
                <div className="relative">
                    <input className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none" name="percentage" type="number" step="0.0001" placeholder="Tỷ lệ trúng (VD: 99.9)" value={promoForm.percentage} onChange={handlePromoChange} required />
                    <span className="absolute right-3 top-3 text-gray-400 font-bold">%</span>
                </div>
                <div className="flex items-center gap-2 border p-2 rounded-lg bg-white">
                    <span className="text-gray-700 font-medium">Màu ô:</span>
                    <input type="color" name="color" value={promoForm.color} onChange={handlePromoChange} className="h-8 w-full cursor-pointer rounded border-none" />
                </div>
                <button type="submit" className="md:col-span-2 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 font-bold shadow-md transition">
                    + Thêm Ô Này Vào Vòng Quay
                </button>
              </form>
              <p className="text-xs text-gray-500 mt-2 italic">* Mẹo: Tổng tỷ lệ các ô nên bằng 100%. Ô nào tỷ lệ càng cao thì User càng dễ quay trúng.</p>
            </div>

            {/* Danh sách các ô */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {promotions.map(promo => (
                    <div key={promo.id} className="relative bg-white p-4 rounded-xl shadow-md border-l-8 flex flex-col gap-1" style={{ borderLeftColor: promo.color }}>
                        <div className="flex justify-between items-start">
                            <h4 className="font-bold text-lg text-gray-800">{promo.label}</h4>
                            <button onClick={() => handleDeletePromo(promo.id)} className="text-red-500 hover:text-red-700 font-bold text-xl bg-red-50 w-8 h-8 flex items-center justify-center rounded-full">×</button>
                        </div>
                        <p className="text-gray-500 text-sm">Giá trị: {promo.value}%</p>
                        <div className="mt-2 text-xs font-bold text-purple-700 bg-purple-100 px-2 py-1 rounded w-fit">
                            Tỷ lệ trúng: {promo.percentage}%
                        </div>
                    </div>
                ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Admin;