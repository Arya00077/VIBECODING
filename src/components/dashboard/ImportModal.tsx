import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Table, Download } from 'lucide-react';
import { Stock } from '../../types';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import toast from 'react-hot-toast';

interface ImportModalProps {
  onClose: () => void;
  onImport: (stocks: Stock[]) => void;
}

export const ImportModal = ({ onClose, onImport }: ImportModalProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [importing, setImporting] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setImporting(true);
    
    try {
      const text = await file.text();
      let stocks: Stock[] = [];

      if (file.name.endsWith('.csv')) {
        stocks = parseCSV(text);
      } else if (file.name.endsWith('.json')) {
        stocks = JSON.parse(text);
      } else {
        throw new Error('Unsupported file format');
      }

      onImport(stocks);
      onClose();
    } catch (error) {
      toast.error('Failed to import file. Please check the format.');
    } finally {
      setImporting(false);
    }
  };

  const parseCSV = (text: string): Stock[] => {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    return lines.slice(1).filter(line => line.trim()).map((line, index) => {
      const values = line.split(',').map(v => v.trim());
      
      return {
        id: Date.now().toString() + index,
        user_id: '1',
        symbol: values[headers.indexOf('symbol')] || '',
        name: values[headers.indexOf('name')] || '',
        quantity: parseInt(values[headers.indexOf('quantity')] || '0'),
        purchase_price: parseFloat(values[headers.indexOf('purchase_price')] || '0'),
        current_price: parseFloat(values[headers.indexOf('current_price')] || '0'),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    });
  };

  const downloadTemplate = () => {
    const csvContent = [
      'symbol,name,quantity,purchase_price,current_price',
      'AAPL,Apple Inc.,10,150.00,185.25',
      'GOOGL,Alphabet Inc.,5,120.00,142.89',
      'MSFT,Microsoft Corporation,8,300.00,378.45'
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Template downloaded!');
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
              <Upload className="w-6 h-6 text-gray-900 dark:text-white" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Import Portfolio</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          {/* File Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Drag and drop your file here, or
            </p>
            <label className="cursor-pointer">
              <span className="text-blue-600 dark:text-blue-400 hover:underline">
                browse files
              </span>
              <input
                type="file"
                className="hidden"
                accept=".csv,.json"
                onChange={handleFileInput}
                disabled={importing}
              />
            </label>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Supports CSV and JSON files
            </p>
          </div>

          {importing && (
            <div className="flex items-center justify-center py-4">
              <motion.div
                className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <span className="ml-2 text-gray-600 dark:text-gray-400">Importing...</span>
            </div>
          )}

          {/* Template Download */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">Need a template?</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Download our CSV template to get started
                  </p>
                </div>
              </div>
              <GlassButton
                size="sm"
                variant="secondary"
                onClick={downloadTemplate}
                className="flex items-center space-x-1"
              >
                <Download className="w-4 h-4" />
                <span>Download</span>
              </GlassButton>
            </div>
          </div>

          {/* Supported Formats */}
          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
            <p className="font-medium mb-1">Supported formats:</p>
            <ul className="space-y-1">
              <li>• CSV: symbol, name, quantity, purchase_price, current_price</li>
              <li>• JSON: Array of stock objects</li>
            </ul>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
};