import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, PieChart, Target } from 'lucide-react';
import { Stock } from '../../types';
import { GlassCard } from '../ui/GlassCard';
import { memo, useMemo } from 'react';

interface PortfolioSummaryProps {
  stocks: Stock[];
}

export const PortfolioSummary = memo(({ stocks }: PortfolioSummaryProps) => {
  const portfolioMetrics = useMemo(() => {
    const totalValue = stocks.reduce((sum, stock) => sum + (stock.current_price * stock.quantity), 0);
    const totalInvested = stocks.reduce((sum, stock) => sum + (stock.purchase_price * stock.quantity), 0);
    const totalGainLoss = totalValue - totalInvested;
    const totalGainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;
    const isPositive = totalGainLoss >= 0;

    return {
      totalValue,
      totalInvested,
      totalGainLoss,
      totalGainLossPercent,
      isPositive
    };
  }, [stocks]);

  const stats = useMemo(() => [
    {
      label: 'Total Portfolio Value',
      value: `₹${portfolioMetrics.totalValue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'blue'
    },
    {
      label: 'Total Invested',
      value: `₹${portfolioMetrics.totalInvested.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: Target,
      color: 'purple'
    },
    {
      label: 'Total Gain/Loss',
      value: `${portfolioMetrics.isPositive ? '+' : ''}₹${Math.abs(portfolioMetrics.totalGainLoss).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: TrendingUp,
      color: portfolioMetrics.isPositive ? 'green' : 'red'
    },
    {
      label: 'Return Percentage',
      value: `${portfolioMetrics.isPositive ? '+' : ''}${portfolioMetrics.totalGainLossPercent.toFixed(2)}%`,
      icon: PieChart,
      color: portfolioMetrics.isPositive ? 'green' : 'red'
    },
  ], [portfolioMetrics]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <GlassCard hover className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className={`
                p-3 rounded-xl
                ${stat.color === 'blue' ? 'bg-blue-500/20 text-blue-400' :
                  stat.color === 'purple' ? 'bg-purple-500/20 text-purple-400' :
                  stat.color === 'green' ? 'bg-green-500/20 text-green-400' :
                  'bg-red-500/20 text-red-400'}
              `}>
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <div>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-1">{stat.label}</p>
              <p className={`text-2xl font-bold ${
                stat.color === 'green' ? 'text-green-400' :
                stat.color === 'red' ? 'text-red-400' :
                'text-gray-900 dark:text-white'
              }`}>
                {stat.value}
              </p>
            </div>
          </GlassCard>
        </motion.div>
      ))}
    </div>
  );