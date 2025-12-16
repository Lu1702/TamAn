// src/store/useCartStore.js
import { create } from 'zustand';

const useCartStore = create((set) => ({
  cart: [], // Mảng chứa các sản phẩm đã mua

  // Hàm thêm sản phẩm
  addToCart: (product) => set((state) => {
    // Kiểm tra xem sản phẩm đã có trong giỏ chưa
    const existingItem = state.cart.find((item) => item.id === product.id);
    
    if (existingItem) {
      // Nếu có rồi thì tăng số lượng lên 1
      return {
        cart: state.cart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        ),
      };
    }
    // Nếu chưa có thì thêm mới vào với số lượng là 1
    return { cart: [...state.cart, { ...product, quantity: 1 }] };
  }),

  // Hàm xóa sản phẩm
  removeFromCart: (productId) => set((state) => ({
    cart: state.cart.filter((item) => item.id !== productId),
  })),

  // Hàm xóa sạch giỏ hàng (sau khi thanh toán)
  clearCart: () => set({ cart: [] }),
}));

export default useCartStore;