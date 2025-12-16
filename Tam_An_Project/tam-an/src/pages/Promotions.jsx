import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Promotions = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [prizes, setPrizes] = useState([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result, setResult] = useState(null);
  
  // State mới để lưu mã trúng thưởng từ server
  const [winCode, setWinCode] = useState('');

  useEffect(() => {
    // 1. Kiểm tra đăng nhập
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    // 2. Lấy danh sách quà từ Admin để vẽ vòng quay
    fetch('http://localhost:5000/api/promotions')
      .then(res => res.json())
      .then(data => setPrizes(data))
      .catch(err => console.error(err));
  }, []);

  const handleSpin = async () => {
    if (isSpinning) return;
    setIsSpinning(true);
    setResult(null); // Reset kết quả cũ
    setWinCode('');

    try {
        // GỌI API SERVER ĐỂ QUAY (BẢO MẬT)
        // Lưu ý: credentials: 'include' để gửi kèm Cookie đăng nhập
        const res = await fetch('http://localhost:5000/api/promotions/spin', {
            method: 'POST',
            credentials: 'include' 
        });
        const data = await res.json();

        if (data.success) {
            // Server trả về giải thưởng (prize) và mã code (code)
            const serverPrize = data.prize;
            const code = data.code;

            // Hiệu ứng quay hình ảnh (Visual)
            const newRotation = rotation + 1800 + Math.random() * 360; 
            setRotation(newRotation);

            // Đợi 5s cho quay xong rồi hiện kết quả
            setTimeout(() => {
                setIsSpinning(false);
                setResult(serverPrize);
                setWinCode(code); // Lưu mã code server cấp
            }, 5000);
        } else {
             alert(data.message || "Có lỗi xảy ra, vui lòng thử lại!");
             setIsSpinning(false);
        }

    } catch (err) {
        console.error(err);
        alert("Lỗi kết nối đến server!");
        setIsSpinning(false);
    }
  };

  // Tính toán màu nền gradient để vẽ vòng quay
  const getWheelGradient = () => {
    if (prizes.length === 0) return 'gray';
    const percent = 100 / prizes.length;
    let gradient = 'conic-gradient(';
    prizes.forEach((prize, index) => {
        gradient += `${prize.color} ${index * percent}% ${(index + 1) * percent}%, `;
    });
    return gradient.slice(0, -2) + ')';
  };

  return (
    <div className="min-h-screen bg-green-50 py-10 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl font-serif font-bold text-green-800 mb-2">Vòng Quay May Mắn</h1>
        <p className="text-gray-600 mb-8">Thử vận may - Nhận ngay ưu đãi khủng từ Tâm An Tea!</p>

        {!user ? (
           // --- GIAO DIỆN CHƯA ĐĂNG NHẬP ---
           <div className="bg-white p-10 rounded-2xl shadow-xl max-w-lg mx-auto border border-red-100">
             <div className="text-6xl mb-4">🔒</div>
             <h2 className="text-2xl font-bold text-gray-800 mb-4">Bạn cần đăng nhập để tham gia</h2>
             <p className="text-gray-500 mb-6">Chương trình ưu đãi chỉ dành riêng cho thành viên.</p>
             <Link to="/login" className="bg-green-700 text-white px-8 py-3 rounded-full font-bold hover:bg-green-800 transition shadow-lg hover:shadow-green-700/40">
                Đăng Nhập Ngay
             </Link>
           </div>
        ) : (
           // --- GIAO DIỆN ĐÃ ĐĂNG NHẬP (HIỆN VÒNG QUAY) ---
           <div className="flex flex-col items-center">
             
             {/* KUNGFU VÒNG QUAY */}
             <div className="relative w-80 h-80 sm:w-96 sm:h-96 mb-10">
                {/* Mũi tên chỉ định */}
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-4 z-20 w-0 h-0 border-l-[20px] border-l-transparent border-r-[20px] border-r-transparent border-t-[40px] border-t-red-600 drop-shadow-lg"></div>
                
                {/* Vòng tròn quay */}
                <div 
                    className="w-full h-full rounded-full border-8 border-white shadow-2xl overflow-hidden transition-transform cubic-bezier(0.25, 0.1, 0.25, 1)"
                    style={{ 
                        background: getWheelGradient(),
                        transform: `rotate(${rotation}deg)`,
                        transitionDuration: '5s' 
                    }}
                ></div>

                {/* Nút Quay ở giữa */}
                <button 
                    onClick={handleSpin}
                    disabled={isSpinning || prizes.length < 2}
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-white rounded-full border-4 border-green-200 shadow-xl flex items-center justify-center font-bold text-green-800 hover:scale-105 transition z-10 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSpinning ? '...' : 'QUAY'}
                </button>
             </div>

             {/* Kết quả */}
             {result && !isSpinning && (
                <div className="animate-bounce bg-yellow-100 border-2 border-yellow-400 text-yellow-800 p-6 rounded-xl shadow-lg max-w-md w-full">
                    <h3 className="text-2xl font-bold mb-2">🎉 Chúc mừng bạn! 🎉</h3>
                    <p className="text-lg mb-4">Bạn nhận được: <span className="font-bold text-red-600 text-xl">{result.label}</span></p>
                    
                    {/* Hiển thị Mã Voucher */}
                    <div className="bg-white p-4 rounded-lg border border-dashed border-yellow-500 relative group">
                        <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Mã Voucher của bạn</p>
                        <div className="text-4xl font-mono font-bold text-green-700 tracking-widest select-all cursor-pointer" title="Copy mã này">
                            {winCode}
                        </div>
                        <p className="text-xs text-gray-400 mt-2">Hãy dùng mã này tại trang Giỏ Hàng để được giảm giá nhé!</p>
                    </div>
                </div>
             )}

             {prizes.length < 2 && (
                 <p className="text-red-500 font-bold bg-red-100 px-4 py-2 rounded mt-4">Chương trình đang bảo trì, vui lòng quay lại sau.</p>
             )}

           </div>
        )}
      </div>
    </div>
  );
};

export default Promotions;