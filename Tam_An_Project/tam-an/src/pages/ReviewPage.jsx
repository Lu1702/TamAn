import React, { useEffect, useState } from 'react';

const ReviewPage = () => {
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
    const [editingId, setEditingId] = useState(null);
    const [editData, setEditData] = useState({ rating: 5, comment: '' });
    const user = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        fetchReviews();
    }, []);

    const fetchReviews = () => {
        fetch('http://localhost:5000/api/reviews')
            .then(res => {
                if (!res.ok) throw new Error('Không thể kết nối đến API Reviews');
                return res.json();
            })
            .then(data => {
                setReviews(data);
            })
            .catch(err => {
                console.error("Lỗi lấy danh sách đánh giá:", err);
            });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (!user) {
            return alert("Vui lòng đăng nhập để gửi đánh giá!");
        }

        fetch('http://localhost:5000/api/reviews', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                user_id: user.id,
                user_name: user.name,
                rating: parseInt(newReview.rating),
                comment: newReview.comment
            }),
        })
        .then(res => {
            if (!res.ok) throw new Error('Gửi đánh giá thất bại');
            alert("Cảm ơn bạn đã đánh giá!");
            // Reset form và load lại danh sách
            setNewReview({ rating: 5, comment: '' });
            fetchReviews();
        })
        .catch(err => {
            console.error("Lỗi khi gửi đánh giá:", err);
            alert("Có lỗi xảy ra, vui lòng thử lại sau.");
        });
    };

    const handleUpdate = (reviewId) => {
        fetch(`http://localhost:5000/api/editreview/${reviewId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                user_id: user.id,
                rating: editData.rating,
                comment: editData.comment
            }),
        })
        .then(res => {
            if (!res.ok) throw new Error('Cập nhật thất bại');
            setEditingId(null); // Thoát chế độ sửa
            fetchReviews(); // Load lại danh sách
            alert("Đã cập nhật đánh giá!");
        })
        .catch(err => alert(err.message));
    };
    return (
        <div className="relative min-h-screen py-12 px-4 font-['Times_New_Roman'] serif overflow-hidden">
            
            {/* BACKGROUND: 30% Opacity sử dụng hình ảnh từ thư mục public */}
            <div 
                className="absolute inset-0 -z-10 bg-cover bg-center bg-no-repeat opacity-30 bg-[url('/images/background.jpg')]"
            ></div>

            <div className="relative z-10 max-w-4xl mx-auto">
                {/* TIÊU ĐỀ: Chữ đen, nằm trong khối trắng mờ */}
                <h1 className="text-4xl md:text-5xl font-bold text-center text-black mb-12 bg-white/40 backdrop-blur-md py-6 rounded-2xl shadow-xl border border-white/20">
                    KHÁCH HÀNG NÓI GÌ VỀ TÂM AN?
                </h1>

                {/* FORM GỬI ĐÁNH GIÁ: Thiết kế kính mờ (Glassmorphism) */}
                <div className="bg-white/70 backdrop-blur-lg p-8 rounded-3xl shadow-2xl mb-12 border border-green-100">
                    <h3 className="text-2xl font-bold mb-6 text-green-900 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                        </svg>
                        Chia sẻ cảm nhận của bạn
                    </h3>
                    
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="flex items-center gap-4 bg-white/50 p-3 rounded-xl inline-flex">
                            <span className="font-bold text-gray-700">Đánh giá:</span>
                            <select 
                                value={newReview.rating}
                                onChange={(e) => setNewReview({...newReview, rating: e.target.value})}
                                className="bg-transparent border-none focus:ring-0 font-bold text-yellow-600 cursor-pointer text-lg"
                            >
                                {[5,4,3,2,1].map(num => (
                                    <option key={num} value={num} className="text-black">{num} sao ★</option>
                                ))}
                            </select>
                        </div>

                        <textarea 
                            className="w-full p-4 bg-white/50 border-2 border-white/50 rounded-2xl focus:border-green-600 focus:bg-white transition-all outline-none text-lg min-h-[120px]"
                            placeholder="Trà của Tâm An hôm nay thế nào..."
                            value={newReview.comment}
                            onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                            required
                        ></textarea>

                        <div className="flex justify-end">
                            <button className="bg-black text-white px-10 py-3 rounded-full hover:bg-gray-800 transition-all uppercase font-bold tracking-widest shadow-lg active:scale-95">
                                Gửi Đánh Giá
                            </button>
                        </div>
                    </form>
                </div>

                <div className="grid gap-6">
                    {reviews.map(rev => (
                        <div key={rev.id} className="bg-white/90 p-6 rounded-2xl shadow-lg border-l-8 border-green-800">
                            {editingId === rev.id ? (
                                /* --- GIAO DIỆN KHI ĐANG SỬA --- */
                                <div className="space-y-4">
                                    <select 
                                        value={editData.rating}
                                        onChange={(e) => setEditData({...editData, rating: e.target.value})}
                                        className="border p-1 rounded"
                                    >
                                        {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} sao</option>)}
                                    </select>
                                    <textarea 
                                        className="w-full p-2 border rounded"
                                        value={editData.comment}
                                        onChange={(e) => setEditData({...editData, comment: e.target.value})}
                                    />
                                    <div className="flex gap-2">
                                        <button onClick={() => handleUpdate(rev.id)} className="bg-green-700 text-white px-4 py-1 rounded">Lưu</button>
                                        <button onClick={() => setEditingId(null)} className="bg-gray-500 text-white px-4 py-1 rounded">Hủy</button>
                                    </div>
                                </div>
                            ) : (
                                /* --- GIAO DIỆN HIỂN THỊ BÌNH THƯỜNG --- */
                                <>
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="font-black text-xl text-green-950">{rev.user_name}</span>
                                            <div className="text-yellow-500">{"★".repeat(rev.rating)}</div>
                                        </div>
                                        {/* CHỈ HIỆN NÚT SỬA NẾU LÀ CỦA CHÍNH HỌ */}
                                        {user && user.id === rev.user_id && (
                                            <button 
                                                onClick={() => {
                                                    setEditingId(rev.id);
                                                    setEditData({ rating: rev.rating, comment: rev.comment });
                                                }}
                                                className="text-blue-600 hover:underline text-sm font-bold"
                                            >
                                                Sửa đánh giá
                                            </button>
                                        )}
                                    </div>
                                    <p className="mt-2 italic">"{rev.comment}"</p>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ReviewPage;