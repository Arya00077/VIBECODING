import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Newspaper, Clock, ExternalLink, Filter } from 'lucide-react';
import { NewsItem } from '../../types';
import { stockService } from '../../services/stockService';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';

export const NewsSection = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'market' | 'stock' | 'economy' | 'policy'>('all');

  useEffect(() => {
    const fetchNews = async () => {
      setLoading(true);
      try {
        const newsData = await stockService.getNews();
        setNews(newsData);
      } catch (error) {
        console.error('Failed to fetch news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  const filteredNews = filter === 'all' ? news : news.filter(item => item.category === filter);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'market': return 'bg-blue-500/20 text-blue-600 dark:text-blue-400';
      case 'stock': return 'bg-green-500/20 text-green-600 dark:text-green-400';
      case 'economy': return 'bg-purple-500/20 text-purple-600 dark:text-purple-400';
      case 'policy': return 'bg-orange-500/20 text-orange-600 dark:text-orange-400';
      default: return 'bg-gray-500/20 text-gray-600 dark:text-gray-400';
    }
  };

  const filters = [
    { id: 'all', label: 'All News' },
    { id: 'market', label: 'Market' },
    { id: 'stock', label: 'Stocks' },
    { id: 'economy', label: 'Economy' },
    { id: 'policy', label: 'Policy' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-red-500/20">
            <Newspaper className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Market News</h2>
            <p className="text-gray-600 dark:text-gray-400">Latest updates from Indian markets</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="bg-white/10 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white"
          >
            {filters.map((f) => (
              <option key={f.id} value={f.id} className="bg-white dark:bg-gray-800">
                {f.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <GlassCard key={i} className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
                <div className="flex justify-between items-center">
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
                  <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-1/3"></div>
                </div>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <GlassCard hover className="p-6 h-full flex flex-col">
                <div className="flex items-start justify-between mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                    {item.category.toUpperCase()}
                  </span>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <Clock className="w-3 h-3 mr-1" />
                    {item.timestamp}
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2">
                  {item.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 flex-grow line-clamp-3">
                  {item.summary}
                </p>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    {item.source}
                  </span>
                  <GlassButton
                    size="sm"
                    className="flex items-center space-x-1 text-xs"
                    onClick={() => window.open(item.url, '_blank')}
                  >
                    <span>Read More</span>
                    <ExternalLink className="w-3 h-3" />
                  </GlassButton>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      {filteredNews.length === 0 && !loading && (
        <div className="text-center py-12">
          <Newspaper className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No news found for the selected filter.</p>
        </div>
      )}
    </motion.div>
  );
};