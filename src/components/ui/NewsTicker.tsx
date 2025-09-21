import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Upload, Download, Share } from 'lucide-react';
import { Stock } from '../../types';
import { stockService } from '../../services/stockService';
import { Header } from './Header';
import { PortfolioSummary } from './PortfolioSummary';
import { StockCard } from './StockCard';
import { StockChart } from './StockChart';
import { SmartAnalyzer } from './SmartAnalyzer';
import { NewsSection } from './NewsSection';
import { MarketOverview } from './MarketOverview';
import { NewsTicker } from '../ui/NewsTicker';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import { AddStockModal } from './AddStockModal';
import { ImportModal } from './ImportModal';
import { ExportModal } from './ExportModal';
import { ShareModal } from '../ui/ShareModal';
import toast from 'react-hot-toast';

// Mock portfolio data
const MOCK_PORTFOLIO: Stock[] = [
  {
    id: '1',
    user_id: '1',
    symbol: 'RELIANCE',
    name: 'Reliance Industries Ltd.',
    quantity: 50,
    purchase_price: 2200.50,
    current_price: 2456.75,
    created_at: '2024-01-15',
    updated_at: '2024-01-15'
  },
  {
    id: '2',
    user_id: '1',
    symbol: 'TCS',
    name: 'Tata Consultancy Services Ltd.',
    quantity: 25,
    purchase_price: 3500.00,
    current_price: 3678.90,
    created_at: '2024-01-20',
    updated_at: '2024-01-20'
  },
  {
    id: '3',
    user_id: '1',
    symbol: 'HDFCBANK',
    name: 'HDFC Bank Ltd.',
    quantity: 30,
    purchase_price: 1450.00,
    current_price: 1567.45,
    created_at: '2024-02-01',
    updated_at: '2024-02-01'
  },
  {
    id: '4',
    user_id: '1',
    symbol: 'INFY',
    name: 'Infosys Ltd.',
    quantity: 15,
    purchase_price: 1500.00,
    current_price: 1456.30,
    created_at: '2024-02-10',
    updated_at: '2024-02-10'
  }
];

export const Dashboard = () => {
  const [stocks, setStocks] = useState<Stock[]>(MOCK_PORTFOLIO);
  const [selectedStock, setSelectedStock] = useState<Stock>(MOCK_PORTFOLIO[0]);
  const [loading, setLoading] = useState(true);
  const [showAddStock, setShowAddStock] = useState(false);
  const [showImport, setShowImport] = useState(false);
  const [showExport, setShowExport] = useState(false);
  const [showShare, setShowShare] = useState(false);

  const portfolioData = {
    stocks,
    totalValue: stocks.reduce((sum, stock) => sum + (stock.current_price * stock.quantity), 0),
    totalInvested: stocks.reduce((sum, stock) => sum + (stock.purchase_price * stock.quantity), 0),
    totalGainLoss: stocks.reduce((sum, stock) => sum + ((stock.current_price - stock.purchase_price) * stock.quantity), 0),
    totalGainLossPercent: (() => {
      const invested = stocks.reduce((sum, stock) => sum + (stock.purchase_price * stock.quantity), 0);
      const current = stocks.reduce((sum, stock) => sum + (stock.current_price * stock.quantity), 0);
      return invested > 0 ? ((current - invested) / invested) * 100 : 0;
    })()
  };

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const addStock = (newStock: Omit<Stock, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    const stock: Stock = {
      ...newStock,
      id: Date.now().toString(),
      user_id: '1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    setStocks(prev => [...prev, stock]);
    toast.success(`${stock.symbol} added to portfolio!`);
  };

  const removeStock = (stockId: string) => {
    const stock = stocks.find(s => s.id === stockId);
    setStocks(prev => prev.filter(s => s.id !== stockId));
    if (stock) {
      toast.success(`${stock.symbol} removed from portfolio!`);
    }
  };

  const importStocks = (importedStocks: Stock[]) => {
    setStocks(prev => [...prev, ...importedStocks]);
    toast.success(`${importedStocks.length} stocks imported successfully!`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <motion.div
            className="w-16 h-16 border-4 border-gray-900 dark:border-white border-t-transparent rounded-full mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          />
          <p className="text-gray-900 dark:text-white text-lg">Loading your portfolio...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-black">
      <Header portfolioData={portfolioData} />
      
      {/* News Ticker */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4"
      >
        <NewsTicker />
      </motion.div>
      
      <motion.main
        id="dashboard-content"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Market Overview */}
        <motion.div variants={itemVariants} className="mb-8">
          <MarketOverview />
        </motion.div>

        {/* Portfolio Summary */}
        <motion.div variants={itemVariants}>
          <PortfolioSummary stocks={stocks} />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Stock Holdings */}
          <motion.div className="lg:col-span-2" variants={itemVariants}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Your Holdings</h2>
              <div className="flex flex-wrap gap-2">
                <GlassButton
                  onClick={() => setShowShare(true)}
                  className="flex items-center space-x-2"
                  size="sm"
                  variant="secondary"
                >
                  <Share className="w-4 h-4" />
                  <span className="hidden sm:inline">Share</span>
                </GlassButton>
                <GlassButton
                  onClick={() => setShowExport(true)}
                  className="flex items-center space-x-2"
                  size="sm"
                  variant="secondary"
                >
                  <Download className="w-4 h-4" />
                  <span className="hidden sm:inline">Export</span>
                </GlassButton>
                <GlassButton
                  onClick={() => setShowImport(true)}
                  className="flex items-center space-x-2"
                  size="sm"
                  variant="secondary"
                >
                  <Upload className="w-4 h-4" />
                  <span className="hidden sm:inline">Import</span>
                </GlassButton>
                <GlassButton
                  onClick={() => setShowAddStock(true)}
                  className="flex items-center space-x-2"
                  size="sm"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add</span>
                </GlassButton>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stocks.map((stock, index) => (
                <motion.div
                  key={stock.id}
                  variants={itemVariants}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => setSelectedStock(stock)}
                  className="cursor-pointer"
                >
                  <StockCard 
                    stock={stock} 
                    onRemove={() => removeStock(stock.id)}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick Stats */}
          <motion.div variants={itemVariants}>
            <GlassCard className="p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <GlassButton 
                  variant="primary" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setShowImport(true)}
                >
                  Import Portfolio
                </GlassButton>
                <GlassButton variant="secondary" size="sm" className="w-full">
                  Market Analysis
                </GlassButton>
                <GlassButton 
                  variant="success" 
                  size="sm" 
                  className="w-full"
                  onClick={() => setShowShare(true)}
                >
                  Share Portfolio
                </GlassButton>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Indian Markets</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/60">S&P 500</span>
                  <span className="text-green-400">+1.2%</span>
                </div>
                <span className="text-blue-200 text-xs opacity-80">
                  <span className="text-white/60">NASDAQ</span>
                  <span className="text-green-400">+0.8%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/60">DOW</span>
                  <span className="text-red-400">-0.3%</span>
                </div>
              </div>
            </GlassCard>
                <div className="w-px h-8 bg-blue-500/40" />
        </div>

        {/* Stock Chart */}
        <motion.div variants={itemVariants} className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Price Chart</h2>
          <StockChart symbol={selectedStock.symbol} name={selectedStock.name} />
        </motion.div>

        {/* AI Analyzer */}
        <motion.div variants={itemVariants} className="mb-8">
          <SmartAnalyzer stocks={stocks} />
        </motion.div>

        {/* News Section */}
        <motion.div variants={itemVariants}>
          <NewsSection />
        </motion.div>
      </motion.main>

      {/* Modals */}
      {showAddStock && (
        <AddStockModal
          onClose={() => setShowAddStock(false)}
          onAdd={addStock}
        />
      )}
      
      {showImport && (
        <ImportModal
          onClose={() => setShowImport(false)}
          onImport={importStocks}
        />
      <motion.div 
        className="h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"
        animate={{ 
          background: [
            'linear-gradient(90deg, #3b82f6, #8b5cf6, #3b82f6)',
            'linear-gradient(90deg, #8b5cf6, #3b82f6, #8b5cf6)',
            'linear-gradient(90deg, #3b82f6, #8b5cf6, #3b82f6)'
          ]
        }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </motion.div>
  );
};