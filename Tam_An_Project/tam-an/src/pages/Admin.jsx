import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('products');

  // --- LOGIC SẢN PHẨM ---
  const [products, setProducts] = useState([]);
  const [productForm, setProductForm] = useState({ name: '', price: '', desc: '', category: '', stock: '' });
  const [imageFile, setImageFile] = useState(null);

  // --- LOGIC ĐƠN HÀNG ---
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || user.role !== 'admin') {
        alert("Bạn không có quyền truy cập!");
        navigate('/');
        return;
    }
    fetchProducts();
    fetchOrders();
  }, [navigate]);

  const fetchProducts = async () => {
    try {
        const res = await fetch('http://localhost:5000/api/products');
        setProducts(await res.json());
    } catch (error) { console.error(error); }
  };

  const fetchOrders = async () => {
    try {
        const res = await fetch('http://localhost:5000/api/orders');
        setOrders(await res.json());
    } catch (error) { console.error(error); }
  };

  // Logic xử lý Form (Giữ nguyên)
  const handleProductChange = (e) => setProductForm({ ...productForm, [e.target.name]: e.target.value });
  const handleFileChange = (e) => setImageFile(e.target.files[0]);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const data = new FormData();
    Object.keys(productForm).forEach(key => data.append(key, productForm[key]));
    if (imageFile) data.append('image', imageFile);

    const res = await fetch('http://localhost:5000/api/products', { method: 'POST', body: data });
    if (res.ok) {
        alert("Thêm món thành công!");
        fetchProducts();
        setProductForm({ name: '', price: '', desc: '', category: '', stock: '' });
        setImageFile(null);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm("Xóa nhé?")) {
        await fetch(`http://localhost:5000/api/products/${id}`, { method: 'DELETE' });
        fetchProducts();
    }
  };

  return (
    // THAY ĐỔI 1: Thêm background image vào container ngoài cùng
    <div 
      className="min-h-screen flex bg-cover bg-center relative"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1597481499750-3e6b22637e12?q=80&w=2070')" }}
    >
      {/* THAY ĐỔI 2: Lớp phủ màu trắng 90% để làm mờ ảnh nền, giúp chữ dễ đọc */}
      <div className="absolute inset-0 bg-white/90 z-0"></div>

      {/* --- SIDEBAR --- */}
      {/* Thêm z-10 để nổi lên trên lớp phủ */}
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
        </nav>
        <div className="p-4 border-t border-green-800">
            <button onClick={() => navigate('/')} className="text-gray-300 hover:text-white text-sm flex items-center gap-2">
                ⬅ Quay về Web
            </button>
        </div>
      </div>

      {/* --- MAIN CONTENT --- */}
      {/* Thêm relative và z-10 để nội dung nổi lên trên lớp phủ */}
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

        {/* VIEW 2: QUẢN LÝ ĐƠN HÀNG */}
        {activeTab === 'orders' && (
          <div className="animate-fade-in">
            <h1 className="text-3xl font-bold mb-6 text-green-800 font-serif border-b-2 border-green-200 pb-2 inline-block">Danh Sách Đơn Hàng</h1>
            <div className="bg-white rounded-xl shadow-lg overflow-x-auto border border-gray-200">
              <table className="min-w-full">
                <thead className="bg-green-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-green-800 uppercase">Mã Đơn</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-green-800 uppercase">Khách Hàng</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-green-800 uppercase">Liên Hệ & Ghi Chú</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-green-800 uppercase">Chi Tiết Món</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-green-800 uppercase">Tổng Tiền</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-green-800 uppercase">Ngày Đặt</th>
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
                            {order.user_id ? 
                                <span className="inline-block mt-1 text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">THÀNH VIÊN</span> : 
                                <span className="inline-block mt-1 text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">VÃNG LAI</span>
                            }
                        </td>
                        <td className="px-6 py-4">
                            <div className="font-medium">{order.phone}</div>
                            <div className="text-gray-500 text-xs mt-0.5">{order.address}</div>
                            {order.note && <div className="text-red-500 italic text-xs mt-2 bg-red-50 p-1 rounded">Note: {order.note}</div>}
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
                        <td className="px-6 py-4 text-gray-500 text-xs">
                            {new Date(order.order_date).toLocaleString('vi-VN')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default Admin;