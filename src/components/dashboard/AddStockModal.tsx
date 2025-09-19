import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, TrendingUp } from 'lucide-react';
import { Stock } from '../../types';
import { stockService } from '../../services/stockService';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import toast from 'react-hot-toast';

interface AddStockModalProps {
  onClose: () => void;
  onAdd: (stock: Omit<Stock, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
}

export const AddStockModal = ({ onClose, onAdd }: AddStockModalProps) => {
  const [symbol, setSymbol] = useState('');
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState('');
  const [searching, setSearching] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const searchStock = async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setSearching(true);
    try {
      // Mock search results
      const mockResults = [
        { symbol: 'AAPL', name: 'Apple Inc.', price: 185.25 },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.89 },
        { symbol: 'MSFT', name: 'Microsoft Corporation', price: 378.45 },
        { symbol: 'TSLA', name: 'Tesla Inc.', price: 248.76 },
        { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', price: 2456.75 },
        { symbol: 'TCS', name: 'Tata Consultancy Services', price: 3678.90 },
      ].filter(stock => 
        stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
        stock.name.toLowerCase().includes(query.toLowerCase())
      );

      setSuggestions(mockResults);
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setSearching(false);
    }
  };

  const selectStock = (stock: any) => {
    setSymbol(stock.symbol);
    setName(stock.name);
    setCurrentPrice(stock.price.toString());
    setPurchasePrice(stock.price.toString());
    setSuggestions([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!symbol || !name || !quantity || !purchasePrice || !currentPrice) {
      toast.error('Please fill all fields');
      return;
    }

    const stock = {
      symbol: symbol.toUpperCase(),
      name,
      quantity: parseInt(quantity),
      purchase_price: parseFloat(purchasePrice),
      current_price: parseFloat(currentPrice),
    };

    onAdd(stock);
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md"
      >
        <GlassCard className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <Plus className="w-6 h-6 text-gray-900 dark:text-white" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add Stock</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Stock Search */}
            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Search Stock
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={symbol}
                  onChange={(e) => {
                    setSymbol(e.target.value);
                    searchStock(e.target.value);
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Enter symbol or company name"
                />
              </div>
              
              {suggestions.length > 0 && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                  {suggestions.map((stock) => (
                    <button
                      key={stock.symbol}
                      type="button"
                      onClick={() => selectStock(stock)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center justify-between"
                    >
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">{stock.symbol}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-400">{stock.name}</div>
                      </div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        ${stock.price}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Company Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Company name"
                required
              />
            </div>

            {/* Quantity and Prices */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="0"
                  min="1"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Purchase Price
                </label>
                <input
                  type="number"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Current Price
              </label>
              <input
                type="number"
                value={currentPrice}
                onChange={(e) => setCurrentPrice(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="0.00"
                step="0.01"
                min="0"
                required
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <GlassButton
                type="button"
                variant="secondary"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </GlassButton>
              <GlassButton
                type="submit"
                variant="primary"
                className="flex-1"
              >
                Add Stock
              </GlassButton>
            </div>
          </form>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
};