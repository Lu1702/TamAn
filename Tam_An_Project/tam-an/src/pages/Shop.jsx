// src/pages/Shop.jsx
import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // --- MỚI: STATE DANH MỤC ---
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(''); // Rỗng = Tất cả

  // Lấy từ khóa tìm kiếm từ URL
  const [searchParams, setSearchParams] = useSearchParams();
  const searchTerm = searchParams.get('search'); 

  // --- 1. LẤY DANH SÁCH DANH MỤC ---
  useEffect(() => {
    fetch('http://localhost:5000/api/categories')
      .then(res => res.json())
      .then(data => {
        // API trả về [{category: 'A'}, {category: 'B'}] -> Map thành ['A', 'B']
        const list = data.map(item => item.category).filter(c => c); 
        setCategories(list);
      })
      .catch(err => console.error("Lỗi lấy danh mục:", err));
  }, []);

  // --- 2. GỌI API LẤY SẢN PHẨM (KẾT HỢP SEARCH & CATEGORY) ---
  useEffect(() => {
    setLoading(true);
    let url = 'http://localhost:5000/api/products?';
    
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (selectedCategory) params.append('category', selectedCategory);

    fetch(url + params.toString())
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
  }, [searchTerm, selectedCategory]); 

  // Xử lý khi bấm nút danh mục
  const handleCategoryClick = (cat) => {
      setSelectedCategory(cat);
      // Nếu đang search thì xóa search đi để tránh rối (Tùy chọn)
      if (searchTerm) setSearchParams({});
  };

  // --- 3. LOGIC THÊM VÀO GIỎ (GIỮ NGUYÊN) ---
  const handleAddToCart = (product) => {
    const user = JSON.parse(localStorage.getItem('user'));
    
    if (user) {
         fetch('http://localhost:5000/api/cart/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include', 
            body: JSON.stringify({ user_id: user.id, product_id: product.id, quantity: 1 })
        })
        .then(async (res) => {
            if (res.status === 401 || res.status === 403) throw new Error("Phiên đăng nhập hết hạn");
            return res.json();
        })
        .then(data => {
            if (data.success) {
                alert(`Đã thêm "${product.name}" vào giỏ hàng!`);
                window.dispatchEvent(new Event("storage"));
            }
        })
        .catch(err => alert(err.message));
    } else {
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingIndex = cart.findIndex((item) => item.id === product.id);
        if (existingIndex !== -1) cart[existingIndex].quantity += 1;
        else cart.push({ id: product.id, name: product.name, price: product.price, img: product.img, quantity: 1 });
        localStorage.setItem('cart', JSON.stringify(cart));
        window.dispatchEvent(new Event("storage"));
        alert(`Đã thêm "${product.name}" vào giỏ hàng!`);
    }
  };

  if (loading && products.length === 0) return <div className="text-center py-20">Đang tải danh sách sản phẩm...</div>;

  return (
    <div className="relative min-h-screen bg-gray-50">
      
      {/* Background Image */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{ backgroundImage: "url('/images/background.jpg')", opacity: 0.3 }}
      ></div>

      <div className="relative z-10 container mx-auto px-4 py-10">
        
        {/* --- THANH LỌC DANH MỤC (FILTER BAR) --- */}
        <div className="mb-8 flex flex-wrap justify-center gap-3">
            <button 
                onClick={() => handleCategoryClick('')}
                className={`px-5 py-2 rounded-full font-bold text-sm transition shadow-sm border ${
                    selectedCategory === '' 
                    ? 'bg-green-700 text-white border-green-700 shadow-lg scale-105' 
                    : 'bg-white text-gray-600 border-gray-200 hover:border-green-500 hover:text-green-700'
                }`}
            >
                Tất cả
            </button>
            
            {categories.map((cat, index) => (
                <button 
                    key={index}
                    onClick={() => handleCategoryClick(cat)}
                    className={`px-5 py-2 rounded-full font-bold text-sm transition shadow-sm border ${
                        selectedCategory === cat 
                        ? 'bg-green-700 text-white border-green-700 shadow-lg scale-105' 
                        : 'bg-white text-gray-600 border-gray-200 hover:border-green-500 hover:text-green-700'
                    }`}
                >
                    {cat}
                </button>
            ))}
        </div>

        {/* HEADER */}
        <div className="mb-10 text-center">
            {searchTerm ? (
                <div>
                    <h1 className="text-3xl font-serif font-bold text-gray-800">
                        Tìm kiếm: <span className="text-green-700">"{searchTerm}"</span>
                    </h1>
                    <p className="text-gray-600 mt-2">Tìm thấy {products.length} sản phẩm.</p>
                    <Link to="/shop" className="text-red-600 font-bold hover:underline mt-2 inline-block">Xóa tìm kiếm</Link>
                </div>
            ) : (
                <div>
                    <h1 className="text-4xl font-serif font-bold text-gray-800 mb-2 drop-shadow-sm">
                        {selectedCategory ? selectedCategory : "Cửa Hàng Trực Tuyến"}
                    </h1>
                    {!selectedCategory && (
                        <p className="text-gray-600 max-w-2xl mx-auto">
                            Tuyển tập các loại trà thượng hạng, đậm đà hương vị tự nhiên.
                        </p>
                    )}
                </div>
            )}
        </div>

        {/* DANH SÁCH SẢN PHẨM */}
        {products.length === 0 ? (
            <div className="text-center py-12 bg-white/80 backdrop-blur-sm rounded-xl border border-dashed border-gray-300">
                <p className="text-gray-500 text-lg mb-4">Không tìm thấy sản phẩm nào phù hợp.</p>
                {(searchTerm || selectedCategory) && (
                    <button onClick={() => { setSearchParams({}); setSelectedCategory(''); }} className="px-6 py-2 bg-green-700 text-white rounded-full hover:bg-green-800 transition">
                        Xem tất cả sản phẩm
                    </button>
                )}
            </div>
        ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                {products.map((product) => (
                <div key={product.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100 flex flex-col">
                    <Link to={`/product/${product.id}`} className="block h-64 overflow-hidden relative group">
                        <img src={product.img} alt={product.name} className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"/>
                        {product.stock <= 0 && (
                            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                                <span className="text-white font-bold px-4 py-2 border border-white rounded">HẾT HÀNG</span>
                            </div>
                        )}
                    </Link>
                    <div className="p-5 flex flex-col flex-grow">
                        <div className="text-xs text-green-600 font-bold uppercase tracking-wider mb-1">{product.category}</div>
                        <Link to={`/product/${product.id}`}>
                            <h3 className="text-xl font-bold text-gray-800 mb-2 hover:text-green-700 transition-colors">{product.name}</h3>
                        </Link>
                        <div className="mt-auto pt-4 flex items-center justify-between">
                            <span className="text-lg font-bold text-green-700">{Number(product.price).toLocaleString('vi-VN')} đ</span>
                            {product.stock > 0 ? (
                                <button onClick={() => handleAddToCart(product)} className="bg-green-600 hover:bg-green-700 text-white p-2 rounded-full shadow transition-colors">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                </button>
                            ) : (
                                <button disabled className="bg-gray-300 text-gray-500 p-2 rounded-full cursor-not-allowed">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default Shop;