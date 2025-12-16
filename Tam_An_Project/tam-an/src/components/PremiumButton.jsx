import React from 'react';

const PremiumButton = ({ text = "Thêm vào giỏ", onClick }) => {
  return (
    <button
      onClick={onClick}
      // Đã đổi: shadow-yellow -> shadow-green, gradient yellow -> green
      className="group relative cursor-pointer p-1 rounded-xl bg-gradient-to-br from-green-800 via-green-600 to-green-800 hover:from-green-700 hover:via-green-500 hover:to-green-600 hover:shadow-lg hover:shadow-green-700/60 transition-all ease-in-out duration-300 hover:scale-105 active:scale-95"
    >
      {/* Lớp nền tối bên trong (giữ dark mode để làm nổi bật màu xanh) */}
      <div className="px-6 py-2 backdrop-blur-xl bg-black/80 rounded-xl font-bold w-full h-full">
        <div className="flex items-center justify-center gap-2 text-green-500 group-hover:text-green-400 transition-colors duration-300">
          
          {/* Icon (Tôi giữ nguyên icon ngôi sao hình học, nhưng đổi màu stroke sang xanh) */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.8"
            className="w-6 h-6 stroke-green-600 group-hover:stroke-green-400 transition-colors duration-300"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
            ></path>
          </svg>
          
          {/* Text */}
          <span className="uppercase tracking-wide text-sm">{text}</span>
        </div>
      </div>
    </button>
  );
};

export default PremiumButton;