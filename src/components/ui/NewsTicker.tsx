import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

const NEWS_ITEMS = [
  {
    text: "🇮🇳 NIFTY 50 hits new record high at 21,847 points amid strong FII inflows",
    type: "positive" as const
  },
  {
    text: "📈 Banking sector rallies 3.2% led by HDFC Bank and ICICI Bank",
    type: "positive" as const
  },
  {
    text: "💼 IT stocks surge on robust Q3 earnings - TCS up 4.5%, Infosys up 3.8%",
    type: "positive" as const
  },
  {
    text: "⚡ Energy sector gains momentum as crude oil stabilizes above $85",
    type: "positive" as const
  },
  {
    text: "🏦 RBI maintains repo rate at 6.5% - GDP growth forecast at 6.8%",
    type: "neutral" as const
  },
  {
    text: "📊 Mutual fund inflows hit record ₹1.2 lakh crores in Q3",
    type: "positive" as const
  }
];

export const NewsTicker = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsVisible(false);
      setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % NEWS_ITEMS.length);
        setIsVisible(true);
      }, 300);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const currentNews = NEWS_ITEMS[currentIndex];
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'positive':
        return <TrendingUp className="w-4 h-4 text-green-400" />;
      case 'negative':
        return <TrendingDown className="w-4 h-4 text-red-400" />;
      default:
        return <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case 'positive':
        return 'from-green-600 to-green-700';
      case 'negative':
        return 'from-red-600 to-red-700';
      default:
        return 'from-blue-600 to-blue-700';
    }
  };

  return (
    <div className={`bg-gradient-to-r ${getBgColor(currentNews.type)} text-white py-3 px-4 overflow-hidden relative`}>
      <div className="absolute inset-0 bg-black/10" />
      <div className="relative flex items-center justify-center space-x-3">
        <div className="flex items-center space-x-2">
          {getIcon(currentNews.type)}
          <span className="text-sm font-semibold uppercase tracking-wider">Live Market News</span>
        </div>
        
        <div className="flex-1 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -20 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="font-medium text-sm md:text-base"
            >
              {currentNews.text}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex items-center space-x-1">
          {NEWS_ITEMS.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                index === currentIndex ? 'bg-white' : 'bg-white/30'
              }`}
            />
          ))}
        </div>
      </div>
      
      {/* Animated border */}
      <motion.div
        className="absolute bottom-0 left-0 h-0.5 bg-white/50"
        initial={{ width: '0%' }}
        animate={{ width: '100%' }}
        transition={{ duration: 5, ease: 'linear', repeat: Infinity }}
      />
    </div>
  );
};