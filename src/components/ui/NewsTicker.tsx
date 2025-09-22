import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export const NewsTicker = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const newsItems = [
    "Market Update: BSE Sensex up 1.2% in early trading",
    "Tech stocks showing strong momentum this week",
    "Banking sector leads gains with HDFC Bank up 2.5%",
    "Oil prices stabilize after recent volatility"
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % newsItems.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [newsItems.length]);

  return (
    <div className="bg-blue-600 text-white py-2 overflow-hidden">
      <motion.div
        key={currentIndex}
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ duration: 0.5 }}
        className="text-center font-medium"
      >
        {newsItems[currentIndex]}
      </motion.div>
    </div>
  );
};