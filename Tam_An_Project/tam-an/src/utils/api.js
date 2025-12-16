export const apiRequest = async (url, options = {}) => {
  const defaultOptions = {
    ...options,
    credentials: 'include', // QUAN TRỌNG NHẤT: Để gửi cookie đi
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  };

  try {
    let response = await fetch(url, defaultOptions);

    // Nếu gặp lỗi 401 (Unauthorized) hoặc 403 -> Có thể do hết hạn Access Token
    if (response.status === 401 || response.status === 403) {
      console.log("Token hết hạn, đang thử lấy lại...");
      
      // Gọi API refresh token
      const refreshRes = await fetch('http://localhost:5000/api/refresh', {
        method: 'POST',
        credentials: 'include' // Gửi Refresh Token (trong cookie) đi
      });

      if (refreshRes.ok) {
        console.log("Refresh thành công! Gọi lại API cũ...");
        // Nếu refresh thành công, gọi lại API ban đầu
        response = await fetch(url, defaultOptions);
      } else {
        // Nếu refresh thất bại (Hết hạn cả 2, hoặc bị đăng nhập nơi khác)
        console.log("Phiên đăng nhập hết hạn.");
        localStorage.removeItem('user'); // Xóa user info
        window.location.href = '/login'; // Đá về trang login
        return null;
      }
    }

    return response;
  } catch (error) {
    console.error("Lỗi API:", error);
    throw error;
  }
};