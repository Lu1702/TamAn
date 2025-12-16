// src/pages/Product.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PremiumButton from '../components/PremiumButton';

const Product = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // Lấy danh sách sản phẩm
  useEffect(() => {
    fetch(`http://localhost:5000/api/products/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Không tìm thấy');
        return res.json();
      })
      .then((data) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((err) => setLoading(false));
  }, [id]);

  const handleQuantityChange = (type) => {
    if (type === 'decrease' && quantity > 1) setQuantity(quantity - 1);
    else if (type === 'increase' && product && quantity < product.stock) setQuantity(quantity + 1);
  };

  // --- SỬA LOGIC THÊM VÀO GIỎ (ĐÃ SỬA LỖI COOKIE) ---
  const handleAddToCart = () => {
    if (!product) return;
    const user = JSON.parse(localStorage.getItem('user'));

    if (user) {
        // 1. NẾU ĐÃ ĐĂNG NHẬP -> GỌI API KÈM COOKIE
        fetch('http://localhost:5000/api/cart/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', // <--- QUAN TRỌNG: Gửi Cookie đi
            body: JSON.stringify({
                user_id: user.id,
                product_id: product.id,
                quantity: quantity
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
            if (data && data.success) {
                alert(`Đã thêm ${quantity} hộp "${product.name}" vào giỏ hàng (Server)!`);
                window.dispatchEvent(new Event("storage")); // Báo header cập nhật
            }
        })
        .catch(err => alert(err.message));

    } else {
        // 2. NẾU CHƯA ĐĂNG NHẬP -> DÙNG LOCALSTORAGE
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingIndex = cart.findIndex((item) => item.id === product.id);

        if (existingIndex !== -1) {
            cart[existingIndex].quantity += quantity;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                img: product.img, 
                quantity: quantity
            });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        window.dispatchEvent(new Event("storage"));
        alert(`Đã thêm ${quantity} hộp "${product.name}" vào giỏ hàng!`);
    }
  };

  if (loading) return <div className="text-center py-20">Đang tải...</div>;
  if (!product) return <div className="text-center py-20">Không tìm thấy sản phẩm</div>;

  return (
    <div className="container mx-auto px-4 py-10 md:py-16">
      <div className="text-sm text-gray-500 mb-6">
        <span className="cursor-pointer hover:text-green-600" onClick={() => navigate('/shop')}>Cửa hàng</span> / 
        <span className="text-gray-800 ml-1 font-medium">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
        <div className="w-full bg-gray-50 rounded-2xl p-4 border border-gray-100">
          <img 
            src={product.img} 
            alt={product.name} 
            className="w-full h-auto object-cover rounded-xl shadow-md"
          />
        </div>

        <div className="flex flex-col justify-center space-y-6">
          <div>
            <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full uppercase">
              {product.category}
            </span>
            <h1 className="text-3xl font-serif font-bold text-gray-900 mt-3">{product.name}</h1>
            <p className="text-2xl text-green-700 font-bold mt-2">
              {Number(product.price).toLocaleString('vi-VN')} VNĐ
            </p>
          </div>
          <div className="h-px bg-gray-200 w-full"></div>
          <p className="text-gray-600 text-lg leading-relaxed">{product.desc}</p>

          <div className="flex items-center space-x-4">
            <span className="font-medium text-gray-700">Số lượng:</span>
            <div className="flex items-center border border-gray-300 rounded-lg">
              <button onClick={() => handleQuantityChange('decrease')} className="px-3 py-2 hover:bg-gray-100">-</button>
              <span className="px-4 py-2 font-semibold w-10 text-center">{quantity}</span>
              <button onClick={() => handleQuantityChange('increase')} className="px-3 py-2 hover:bg-gray-100">+</button>
            </div>
            <span className="text-sm text-gray-500">(Còn {product.stock} sản phẩm)</span>
          </div>

          <div className="pt-4 w-full sm:w-auto">
            <PremiumButton text="Thêm Vào Giỏ Hàng" onClick={handleAddToCart} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Product;