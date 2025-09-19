import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Globe, MapPin, Bitcoin } from 'lucide-react';
import { MarketIndex } from '../../types';
import { stockService } from '../../services/stockService';
import { GlassCard } from '../ui/GlassCard';

export const MarketOverview = () => {
  const [indices, setIndices] = useState<MarketIndex[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState<'IN' | 'US' | 'GLOBAL' | 'CRYPTO' | 'ALL'>('ALL');

  useEffect(() => {
    const fetchIndices = async () => {
      setLoading(true);
      try {
        const data = await stockService.getMarketIndices();
        setIndices(data);
      } catch (error) {
        console.error('Failed to fetch market indices:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIndices();
  }, []);

  const filteredIndices = selectedRegion === 'ALL' 
    ? indices 
    : selectedRegion === 'GLOBAL'
    ? indices.filter(index => !['IN', 'US', 'CRYPTO'].includes(index.country))
    : indices.filter(index => index.country === selectedRegion);

  const getFlag = (country: string) => {
    const flags: Record<string, string> = {
      'IN': '🇮🇳',
      'US': '🇺🇸',
      'UK': '🇬🇧',
      'DE': '🇩🇪',
      'JP': '🇯🇵',
      'HK': '🇭🇰',
      'FR': '🇫🇷',
      'CRYPTO': '₿'
    };
    return flags[country] || '🌍';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-3 rounded-xl bg-blue-500/20">
            <Globe className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Market Overview</h2>
            <p className="text-gray-600 dark:text-gray-400">Global market indices at a glance</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <MapPin className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          <select
            value={selectedRegion}
            onChange={(e) => setSelectedRegion(e.target.value as any)}
            className="bg-white/10 dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white"
          >
            <option value="ALL" className="bg-white dark:bg-gray-800">All Markets</option>
            <option value="IN" className="bg-white dark:bg-gray-800">🇮🇳 Indian Markets</option>
            <option value="US" className="bg-white dark:bg-gray-800">🇺🇸 US Markets</option>
            <option value="GLOBAL" className="bg-white dark:bg-gray-800">🌍 Global Markets</option>
            <option value="CRYPTO" className="bg-white dark:bg-gray-800">₿ Cryptocurrency</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(12)].map((_, i) => (
            <GlassCard key={i} className="p-4">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-2/3"></div>
              </div>
            </GlassCard>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredIndices.map((index, i) => (
            <motion.div
              key={index.symbol}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <GlassCard hover className={`p-4 ${
                index.country === 'CRYPTO' 
                  ? 'bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border-orange-500/20' 
                  : ''
              }`}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{getFlag(index.country)}</span>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                        {index.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {index.symbol}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {index.change >= 0 ? (
                      <TrendingUp className="w-4 h-4 text-green-500" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="text-xl font-bold text-gray-900 dark:text-white">
                    {index.country === 'CRYPTO' ? '$' : ''}
                    {index.value.toLocaleString('en-US', { 
                      minimumFractionDigits: 2, 
                      maximumFractionDigits: 2 
                    })}
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${
                      index.change >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {index.change >= 0 ? '+' : ''}
                      {index.country === 'CRYPTO' ? '$' : ''}
                      {index.change.toFixed(2)}
                    </span>
                    <span className={`text-sm font-medium ${
                      index.changePercent >= 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {index.changePercent >= 0 ? '+' : ''}{index.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>

                <motion.div
                  className="mt-3 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                >
                  <motion.div
                    className={`h-full ${
                      index.change >= 0 
                        ? index.country === 'CRYPTO' ? 'bg-orange-500' : 'bg-green-500'
                        : 'bg-red-500'
                    }`}
                    initial={{ width: '0%' }}
                    animate={{ width: `${Math.min(Math.abs(index.changePercent) * 10, 100)}%` }}
                    transition={{ delay: 0.8 + i * 0.1, duration: 0.8 }}
                  />
                </motion.div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      )}

      {filteredIndices.length === 0 && !loading && (
        <div className="text-center py-8">
          <Globe className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No market data available for the selected region.</p>
        </div>
      )}
    </motion.div>
  );
};