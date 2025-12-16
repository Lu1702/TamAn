import React from 'react';
import { Link } from 'react-router-dom';

const TeaButton = ({ to, children, className = '', onClick }) => {
  // Style chung cho tất cả các nút
  const baseStyle = "inline-block px-6 py-2 border border-tea-dark text-tea-dark rounded-full hover:bg-tea-dark hover:text-white transition duration-300 cursor-pointer";

  // Nếu có props 'to' thì dùng Link (chuyển trang), nếu không thì dùng div/button (để click sự kiện)
  if (to) {
    return (
      <Link to={to} className={`${baseStyle} ${className}`}>
        {children}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={`${baseStyle} ${className}`}>
      {children}
    </button>
  );
};

export default TeaButton;