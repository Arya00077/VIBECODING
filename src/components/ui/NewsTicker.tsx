import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { NewsItem } from '../../types';
import { stockService } from '../../services/stockService';

export const NewsTicker = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const newsData = await stockService.getNews();
        setNews(newsData.slice(0, 10)); // Top 10 headlines
      } catch (error) {
        console.error('Failed to fetch news:', error);
      }
    };

    fetchNews();
    const newsInterval = setInterval(fetchNews, 300000); // Update every 5 minutes

    return () => clearInterval(newsInterval);
  }, []);

  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Asia/Kolkata'
    });
  };

  return (
    <div className="bg-gradient-to-r from-blue-900/90 to-purple-900/90 backdrop-blur-lg border border-blue-500/20 rounded-xl shadow-xl overflow-hidden">
      {/* Header with Time */}
      <div className="flex items-center justify-between px-6 py-3 bg-gradient-to-r from-blue-800/50 to-purple-800/50 border-b border-blue-500/20">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-red-500/20">
            <TrendingUp className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-white font-semibold text-sm">Live Market News</h3>
            <p className="text-blue-200 text-xs">Real-time financial updates</p>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-white">
          <Clock className="w-4 h-4 text-blue-300" />
          <span className="text-sm font-mono bg-blue-900/50 px-2 py-1 rounded">
            {formatTime(currentTime)} IST
          </span>
        </div>
      </div>

      {/* Scrolling News Ticker */}
      <div className="relative h-12 overflow-hidden">
        <motion.div
          className="flex items-center h-full whitespace-nowrap"
          animate={{ x: ['100%', '-100%'] }}
          transition={{
            duration: 60,
            repeat: Infinity,
            ease: 'linear'
          }}
        >
          {news.map((item, index) => (
            <div key={item.id} className="flex items-center space-x-8 px-8">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  item.category === 'market' ? 'bg-green-400' :
                  item.category === 'stock' ? 'bg-blue-400' :
                  item.category === 'policy' ? 'bg-yellow-400' :
                  'bg-purple-400'
                } animate-pulse`} />
                <span className="text-white text-sm font-medium">
                  {item.title}
                </span>
                <span className="text-blue-200 text-xs">
                  • {item.source} • {item.timestamp}
                </span>
              </div>
              {index < news.length - 1 && (
                <div className="w-px h-6 bg-blue-500/30" />
              )}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Bottom indicator */}
      <div className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500 animate-pulse" />
    </div>
  );
};