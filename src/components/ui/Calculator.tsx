import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator as CalcIcon, TrendingUp, Percent, DollarSign } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';

interface CalculatorProps {
  onClose: () => void;
}

export const Calculator = ({ onClose }: CalculatorProps) => {
  const [activeTab, setActiveTab] = useState<'basic' | 'stock' | 'inflation'>('basic');
  const [display, setDisplay] = useState('0');
  const [previousValue, setPreviousValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [waitingForOperand, setWaitingForOperand] = useState(false);

  // Stock Calculator States
  const [stockPrice, setStockPrice] = useState('');
  const [quantity, setQuantity] = useState('');
  const [brokerage, setBrokerage] = useState('0.1');
  const [stockResult, setStockResult] = useState<any>(null);

  // Inflation Calculator States
  const [initialAmount, setInitialAmount] = useState('');
  const [inflationRate, setInflationRate] = useState('6');
  const [years, setYears] = useState('');
  const [inflationResult, setInflationResult] = useState<any>(null);

  const inputNumber = (num: string) => {
    if (waitingForOperand) {
      setDisplay(num);
      setWaitingForOperand(false);
    } else {
      setDisplay(display === '0' ? num : display + num);
    }
  };

  const inputOperation = (nextOperation: string) => {
    const inputValue = parseFloat(display);

    if (previousValue === null) {
      setPreviousValue(inputValue);
    } else if (operation) {
      const currentValue = previousValue || 0;
      const newValue = calculate(currentValue, inputValue, operation);

      setDisplay(String(newValue));
      setPreviousValue(newValue);
    }

    setWaitingForOperand(true);
    setOperation(nextOperation);
  };

  const calculate = (firstValue: number, secondValue: number, operation: string) => {
    switch (operation) {
      case '+': return firstValue + secondValue;
      case '-': return firstValue - secondValue;
      case '×': return firstValue * secondValue;
      case '÷': return firstValue / secondValue;
      case '=': return secondValue;
      default: return secondValue;
    }
  };

  const performCalculation = () => {
    const inputValue = parseFloat(display);

    if (previousValue !== null && operation) {
      const newValue = calculate(previousValue, inputValue, operation);
      setDisplay(String(newValue));
      setPreviousValue(null);
      setOperation(null);
      setWaitingForOperand(true);
    }
  };

  const clear = () => {
    setDisplay('0');
    setPreviousValue(null);
    setOperation(null);
    setWaitingForOperand(false);
  };

  const calculateStock = () => {
    const price = parseFloat(stockPrice);
    const qty = parseFloat(quantity);
    const brokerageRate = parseFloat(brokerage) / 100;

    if (price && qty) {
      const totalValue = price * qty;
      const brokerageFee = totalValue * brokerageRate;
      const totalCost = totalValue + brokerageFee;

      setStockResult({
        totalValue: totalValue.toFixed(2),
        brokerageFee: brokerageFee.toFixed(2),
        totalCost: totalCost.toFixed(2),
        perShareCost: (totalCost / qty).toFixed(2)
      });
    }
  };

  const calculateInflation = () => {
    const initial = parseFloat(initialAmount);
    const rate = parseFloat(inflationRate) / 100;
    const time = parseFloat(years);

    if (initial && rate && time) {
      const futureValue = initial * Math.pow(1 + rate, time);
      const totalInflation = futureValue - initial;
      const purchasingPower = initial / futureValue;

      setInflationResult({
        futureValue: futureValue.toFixed(2),
        totalInflation: totalInflation.toFixed(2),
        purchasingPower: (purchasingPower * 100).toFixed(2)
      });
    }
  };

  const buttons = [
    ['C', '±', '%', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '=']
  ];

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
              <CalcIcon className="w-6 h-6 text-gray-900 dark:text-white" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Calculator</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {[
              { id: 'basic', label: 'Basic', icon: CalcIcon },
              { id: 'stock', label: 'Stock', icon: TrendingUp },
              { id: 'inflation', label: 'Inflation', icon: Percent }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-md transition-all ${
                  activeTab === tab.id
                    ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Basic Calculator */}
          {activeTab === 'basic' && (
            <div className="space-y-4">
              <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
                <div className="text-right text-2xl font-mono text-gray-900 dark:text-white">
                  {display}
                </div>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {buttons.flat().map((btn) => (
                  <GlassButton
                    key={btn}
                    onClick={() => {
                      if (btn === 'C') clear();
                      else if (btn === '=') performCalculation();
                      else if (['+', '-', '×', '÷'].includes(btn)) inputOperation(btn);
                      else if (btn === '±') setDisplay(String(-parseFloat(display)));
                      else if (btn === '%') setDisplay(String(parseFloat(display) / 100));
                      else inputNumber(btn);
                    }}
                    className={`h-12 ${
                      ['+', '-', '×', '÷', '='].includes(btn)
                        ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                        : btn === 'C'
                        ? 'bg-red-500/20 text-red-600 dark:text-red-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                    } ${btn === '0' ? 'col-span-2' : ''}`}
                  >
                    {btn}
                  </GlassButton>
                ))}
              </div>
            </div>
          )}

          {/* Stock Calculator */}
          {activeTab === 'stock' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Stock Price (₹)
                  </label>
                  <input
                    type="number"
                    value={stockPrice}
                    onChange={(e) => setStockPrice(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Brokerage (%)
                </label>
                <input
                  type="number"
                  value={brokerage}
                  onChange={(e) => setBrokerage(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="0.1"
                  step="0.01"
                />
              </div>
              <GlassButton onClick={calculateStock} className="w-full">
                Calculate
              </GlassButton>
              {stockResult && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Value:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">₹{stockResult.totalValue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Brokerage:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">₹{stockResult.brokerageFee}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-600 dark:text-gray-400">Total Cost:</span>
                    <span className="font-bold text-gray-900 dark:text-white">₹{stockResult.totalCost}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Per Share Cost:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">₹{stockResult.perShareCost}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Inflation Calculator */}
          {activeTab === 'inflation' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Initial Amount (₹)
                </label>
                <input
                  type="number"
                  value={initialAmount}
                  onChange={(e) => setInitialAmount(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="100000"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Inflation Rate (%)
                  </label>
                  <input
                    type="number"
                    value={inflationRate}
                    onChange={(e) => setInflationRate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="6"
                    step="0.1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Years
                  </label>
                  <input
                    type="number"
                    value={years}
                    onChange={(e) => setYears(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="10"
                  />
                </div>
              </div>
              <GlassButton onClick={calculateInflation} className="w-full">
                Calculate
              </GlassButton>
              {inflationResult && (
                <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Future Value:</span>
                    <span className="font-semibold text-gray-900 dark:text-white">₹{inflationResult.futureValue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Total Inflation:</span>
                    <span className="font-semibold text-red-600 dark:text-red-400">₹{inflationResult.totalInflation}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="text-gray-600 dark:text-gray-400">Purchasing Power:</span>
                    <span className="font-bold text-gray-900 dark:text-white">{inflationResult.purchasingPower}%</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </GlassCard>
      </motion.div>
    </motion.div>
  );
};