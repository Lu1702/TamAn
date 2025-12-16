import React from 'react';
import { motion } from 'framer-motion';

const animations = {
  initial: { opacity: 0, y: 20 }, // Bắt đầu: mờ và nằm thấp hơn 20px
  animate: { opacity: 1, y: 0 },  // Kết thúc: rõ và về vị trí gốc
  exit: { opacity: 0, y: -20 },   // Khi thoát: mờ dần và bay lên trên
};

const AnimatedPage = ({ children }) => {
  return (
    <motion.div
      variants={animations}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.3 }} // Thời gian chuyển động (0.3s)
    >
      {children}
    </motion.div>
  );
};

export default AnimatedPage;