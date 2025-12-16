// src/pages/Shop.jsx
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. LẤY TỪ KHÓA TỪ URL
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get('search'); // Lấy từ khóa sau dấu =

  // 2. GỌI API (Tự động lọc theo search)
  useEffect(() => {
    setLoading(true);
    let url = 'http://localhost:5000/api/products';
    
    // Nếu có từ khóa -> Thêm vào URL gọi API
    if (searchTerm) {
        url += `?search=${encodeURIComponent(searchTerm)}`;
    }

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error('Lỗi kết nối');
        return res.json();
      })
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [searchTerm]); // Chạy lại khi searchTerm thay đổi

  // Logic thêm vào giỏ hàng (ĐÃ SỬA LỖI COOKIE)
  const handleAddToCart = (product) => {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (user) {
         // --- TRƯỜNG HỢP 1: CÓ USER -> GỌI API KÈM COOKIE ---
         fetch('http://localhost:5000/api/cart/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // <--- QUAN TRỌNG: Gửi Cookie đi
            body: JSON.stringify({ 
                user_id: user.id, 
                product_id: product.id, 
                quantity: 1 
            })
        })
        .then(async (res) => {
            // Nếu lỗi 401/403 (Hết hạn token)
            if (res.status === 401 || res.status === 403) {
                throw new Error("Phiên đăng nhập hết hạn, vui lòng đăng nhập lại.");
            }
            return res.json();
        })
        .then(data => {
            if (data.success) {
                alert(`Đã thêm "${product.name}" vào giỏ hàng!`);
                window.dispatchEvent(new Event("storage"));
            }
        })
        .catch(err => {
            alert(err.message);
        });
    } else {
        // --- TRƯỜNG HỢP 2: KHÁCH VÃNG LAI -> LOCALSTORAGE ---
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingIndex = cart.findIndex((item) => item.id === product.id);
        if (existingIndex !== -1) cart[existingIndex].quantity += 1;
        else cart.push({ id: product.id, name: product.name, price: product.price, img: product.img, quantity: 1 });
        localStorage.setItem('cart', JSON.stringify(cart));
        window.dispatchEvent(new Event("storage"));
        alert(`Đã thêm "${product.name}" vào giỏ hàng!`);
    }
  };

  if (loading) return <div className="text-center py-20">Đang tải danh sách sản phẩm...</div>;

  return (
    <div className="container mx-auto px-4 py-10">
      
      {/* --- PHẦN 1: HEADER --- */}
      <div className="mb-10 text-center">
        {searchTerm ? (
            <div>
                <h1 className="text-3xl font-serif font-bold text-gray-800">
                    Kết quả tìm kiếm cho: <span className="text-green-700">"{searchTerm}"</span>
                </h1>
                <p className="text-gray-500 mt-2">
                    Tìm thấy {products.length} sản phẩm phù hợp.
                </p>
                <Link to="/shop" className="inline-block mt-4 text-sm text-red-500 hover:text-red-700 hover:underline font-medium transition">
                    &larr; Xóa tìm kiếm / Xem tất cả sản phẩm
                </Link>
            </div>
        ) : (
            <div>
                <h1 className="text-4xl font-serif font-bold text-gray-800 mb-4">
                    Cửa Hàng Trực Tuyến
                </h1>
                <p className="text-gray-600 max-w-2xl mx-auto">
                    Khám phá các sản phẩm trà thảo mộc cao cấp của chúng tôi. Tốt cho sức khỏe, đậm đà hương vị tự nhiên.
                </p>
            </div>
        )}
      </div>

      {/* --- PHẦN 2: DANH SÁCH SẢN PHẨM --- */}
      
      {products.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
            <p className="text-gray-500 text-lg mb-4">Rất tiếc, không tìm thấy sản phẩm nào.</p>
            {searchTerm && (
                <Link to="/shop" className="px-6 py-2 bg-green-700 text-white rounded-full hover:bg-green-800 transition">
                    Quay lại cửa hàng
                </Link>
            )}
        </div>
      ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex flex-col">
                
                <Link to={`/product/${product.id}`} className="block h-64 overflow-hidden relative group">
                  <img 
                    src={product.img} 
                    alt={product.name} 
                    className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />
                  {product.stock <= 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-bold px-4 py-2 border border-white rounded">HẾT HÀNG</span>
                    </div>
                  )}
                </Link>

                <div className="p-5 flex flex-col flex-grow">
                  <div className="text-xs text-green-600 font-bold uppercase tracking-wider mb-1">
                    {product.category}
                  </div>
                  
                  <Link to={`/product/${product.id}`}>
                    <h3 className="text-xl font-bold text-gray-800 mb-2 hover:text-green-700 transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  
                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <span className="text-lg font-bold text-green-700">
                      {Number(product.price).toLocaleString('vi-VN')} đ
                    </span>
                    
                    {/* Nút thêm vào giỏ hàng */}
                    {product.stock > 0 ? (
                      <button 
                        onClick={() => handleAddToCart(product)}
                        className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-full shadow transition-colors"
                        title="Thêm vào giỏ"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </button>
                    ) : (
                      <button disabled className="bg-gray-300 text-gray-500 p-2 rounded-full cursor-not-allowed">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
      )}
    </div>
  );
};

export default Shop;