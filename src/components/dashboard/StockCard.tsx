import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { Stock } from '../../types';
import { GlassCard } from '../ui/GlassCard';

interface StockCardProps {
  stock: Stock;
  marketData?: {
    current_price: number;
    change: number;
    changePercent: number;
  };
}

export const StockCard = ({ stock, marketData }: StockCardProps) => {
  const currentPrice = marketData?.current_price || stock.current_price;
  const change = marketData?.change || 0;
  const changePercent = marketData?.changePercent || 0;
  const totalValue = currentPrice * stock.quantity;
  const totalGainLoss = (currentPrice - stock.purchase_price) * stock.quantity;
  const gainLossPercent = ((currentPrice - stock.purchase_price) / stock.purchase_price) * 100;

  const isPositive = totalGainLoss >= 0;

  return (
    <GlassCard hover className="p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white">{stock.symbol}</h3>
          <p className="text-gray-600 dark:text-gray-400 text-sm">{stock.name}</p>
        </div>
        <div className="flex items-center space-x-1">
          {isPositive ? (
            <TrendingUp className="w-5 h-5 text-green-400" />
          ) : (
            <TrendingDown className="w-5 h-5 text-red-400" />
          )}
          <span className={`text-sm font-medium ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
            {changePercent > 0 ? '+' : ''}{changePercent.toFixed(2)}%
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Current Price</span>
          <span className="text-gray-900 dark:text-white font-semibold">₹{currentPrice.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Quantity</span>
          <span className="text-gray-900 dark:text-white">{stock.quantity}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Total Value</span>
          <span className="text-gray-900 dark:text-white font-semibold">₹{totalValue.toFixed(2)}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Gain/Loss</span>
          <div className="text-right">
            <div className={`font-semibold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              {isPositive ? '+' : ''}₹{totalGainLoss.toFixed(2)}
            </div>
            <div className={`text-sm ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
              ({isPositive ? '+' : ''}{gainLossPercent.toFixed(2)}%)
            </div>
          </div>
        </div>
      </div>

      <motion.div
        className="mt-4 h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <motion.div
          className={`h-full ${isPositive ? 'bg-green-400' : 'bg-red-400'}`}
          initial={{ width: '0%' }}
          animate={{ width: `${Math.min(Math.abs(gainLossPercent) * 2, 100)}%` }}
          transition={{ delay: 0.8, duration: 0.8 }}
        />
      </motion.div>
    </GlassCard>
  );
};