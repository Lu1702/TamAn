import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- 1. ĐỊNH NGHĨA STYLE CHO BUTTON TẠI ĐÂY ---
  // Bạn có thể sửa màu ở đây (ví dụ: đổi green-800 thành tea-dark nếu đã cấu hình)
  const buttonStyle = "inline-block px-6 py-2 border border-green-800 text-green-800 rounded-full hover:bg-green-800 hover:text-white transition duration-300 cursor-pointer text-center";

  useEffect(() => {
    fetch('http://localhost:5000/api/products')
      .then((res) => res.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((error) => {
        console.error('Lỗi khi tải hàng:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center py-20 text-gray-500">Đang tải danh sách...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h2 className="text-3xl font-serif text-green-800 mb-8 text-center">
        Danh Mục Sản Phẩm
      </h2>
      
      {products.length === 0 ? (
        <div className="text-center text-gray-500">Chưa có sản phẩm nào.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((product) => (
            <div
              key={product.id}
              className="group border border-stone-200 rounded-xl overflow-hidden hover:shadow-lg transition bg-white"
            >
              {/* Phần Ảnh */}
              <div className="h-64 overflow-hidden relative">
                <img
                  src={product.image || product.img || 'https://via.placeholder.com/300?text=No+Image'} 
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                />
              </div>

              {/* Phần Thông tin */}
              <div className="p-4 text-center">
                <h3 className="text-xl font-serif font-bold text-gray-800">
                  {product.name}
                </h3>
                <p className="text-green-800 font-medium my-2">
                  {Number(product.price).toLocaleString()} VNĐ
                </p>
                
                {/* --- 2. SỬ DỤNG BIẾN STYLE ĐÃ KHAI BÁO --- */}
                {/* Dùng template literal `` để nối thêm class 'mt-2' nếu cần căn chỉnh riêng */}
                <Link
                  to={`/product/${product.id}`}
                  className={`${buttonStyle} mt-2`} 
                >
                  Xem chi tiết
                </Link>
                
                {/* Ví dụ: Nếu bạn muốn thêm 1 nút "Mua ngay" bên cạnh dùng chung style thì làm thế này:
                <button 
                    className={`${buttonStyle} mt-2 ml-2 bg-green-50`}
                    onClick={() => console.log('Đã thêm vào giỏ')}
                >
                    Mua ngay
                </button> 
                */}

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Shop;