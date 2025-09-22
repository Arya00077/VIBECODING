import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Table, Download, Image, Eye, Loader } from 'lucide-react';
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
  const [ocrProgress, setOcrProgress] = useState(0);
  const [processingType, setProcessingType] = useState<'csv' | 'excel' | 'image' | null>(null);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  };

  const handleFile = async (file: File) => {
    setImporting(true);
    setOcrProgress(0);
    
    try {
      let stocks: Stock[] = [];
      const fileType = file.type;
      const fileName = file.name.toLowerCase();

      if (fileType === 'text/csv' || fileName.endsWith('.csv')) {
        setProcessingType('csv');
        const text = await file.text();
        stocks = parseCSV(text);
      } else if (fileType.includes('sheet') || fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
        setProcessingType('excel');
        stocks = await parseExcel(file);
      } else if (fileType.startsWith('image/')) {
        setProcessingType('image');
        stocks = await parseImageWithOCR(file);
      } else {
        throw new Error('Unsupported file format');
      }

      if (stocks.length === 0) {
        throw new Error('No valid stock data found in the file');
      }

      onImport(stocks);
      toast.success(`Successfully imported ${stocks.length} stocks!`);
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Failed to import file. Please check the format.');
    } finally {
      setImporting(false);
      setProcessingType(null);
      setOcrProgress(0);
    }
  };

  const parseExcel = async (file: File): Promise<Stock[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          // Dynamically import XLSX
          const XLSX = await import('xlsx');
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
          
          const stocks = parseExcelData(jsonData as any[][]);
          resolve(stocks);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read Excel file'));
      reader.readAsArrayBuffer(file);
    });
  };

  const parseExcelData = (data: any[][]): Stock[] => {
    if (data.length < 2) return [];
    
    const headers = data[0].map((h: any) => h?.toString().toLowerCase().trim());
    const symbolIndex = headers.findIndex((h: string) => h.includes('symbol') || h.includes('ticker'));
    const nameIndex = headers.findIndex((h: string) => h.includes('name') || h.includes('company'));
    const quantityIndex = headers.findIndex((h: string) => h.includes('quantity') || h.includes('qty') || h.includes('shares'));
    const purchasePriceIndex = headers.findIndex((h: string) => h.includes('purchase') || h.includes('buy') || h.includes('cost'));
    const currentPriceIndex = headers.findIndex((h: string) => h.includes('current') || h.includes('market') || h.includes('price'));
    
    return data.slice(1)
      .filter(row => row && row.length > 0 && row[symbolIndex])
      .map((row, index) => ({
        id: Date.now().toString() + index,
        user_id: '1',
        symbol: row[symbolIndex]?.toString().toUpperCase() || '',
        name: row[nameIndex]?.toString() || `${row[symbolIndex]} Company`,
        quantity: Math.max(1, parseInt(row[quantityIndex]?.toString() || '1')),
        purchase_price: Math.max(0, parseFloat(row[purchasePriceIndex]?.toString() || '0')),
        current_price: Math.max(0, parseFloat(row[currentPriceIndex]?.toString() || row[purchasePriceIndex]?.toString() || '0')),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))
      .filter(stock => stock.symbol && stock.purchase_price > 0);
  };

  const parseImageWithOCR = async (file: File): Promise<Stock[]> => {
    return new Promise(async (resolve, reject) => {
      try {
        // Dynamically import Tesseract
        const Tesseract = await import('tesseract.js');
        
        const { data: { text } } = await Tesseract.recognize(file, 'eng', {
          logger: (m) => {
            if (m.status === 'recognizing text') {
              setOcrProgress(Math.round(m.progress * 100));
            }
          }
        });
        
        const stocks = parseOCRText(text);
        resolve(stocks);
      } catch (error) {
        reject(error);
      }
    });
  };

  const parseOCRText = (text: string): Stock[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const stocks: Stock[] = [];
    
    // Enhanced pattern matching for stock data
    lines.forEach((line, index) => {
      // Pattern 1: SYMBOL QTY PRICE PRICE
      let matches = line.match(/([A-Z]{2,10})\s+(\d+)\s+([0-9.]+)\s+([0-9.]+)/);
      if (!matches) {
        // Pattern 2: SYMBOL: QTY @ PRICE
        matches = line.match(/([A-Z]{2,10}):\s*(\d+)\s*@\s*([0-9.]+)/);
        if (matches) {
          matches = [matches[0], matches[1], matches[2], matches[3], matches[3]];
        }
      }
      
      if (matches && matches.length >= 4) {
        const symbol = matches[1];
        const quantity = parseInt(matches[2]) || 1;
        const purchasePrice = parseFloat(matches[3]) || 0;
        const currentPrice = parseFloat(matches[4]) || purchasePrice;
        
        if (symbol && purchasePrice > 0) {
          stocks.push({
            id: Date.now().toString() + index,
            user_id: '1',
            symbol: symbol,
            name: `${symbol} Company`,
            quantity: quantity,
            purchase_price: purchasePrice,
            current_price: currentPrice,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      }
    });
    
    return stocks;
  };

  const parseCSV = (text: string): Stock[] => {
    const lines = text.split('\n').filter(line => line.trim());
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
    const symbolIndex = headers.findIndex(h => h.includes('symbol') || h.includes('ticker'));
    const nameIndex = headers.findIndex(h => h.includes('name') || h.includes('company'));
    const quantityIndex = headers.findIndex(h => h.includes('quantity') || h.includes('qty') || h.includes('shares'));
    const purchasePriceIndex = headers.findIndex(h => h.includes('purchase') || h.includes('buy') || h.includes('cost'));
    const currentPriceIndex = headers.findIndex(h => h.includes('current') || h.includes('market') || h.includes('price'));
    
    return lines.slice(1)
      .map(line => line.split(',').map(v => v.trim().replace(/"/g, '')))
      .filter(values => values.length > Math.max(symbolIndex, quantityIndex, purchasePriceIndex))
      .map((values, index) => ({
        id: Date.now().toString() + index,
        user_id: '1',
        symbol: (values[symbolIndex] || '').toUpperCase(),
        name: values[nameIndex] || `${values[symbolIndex]} Company`,
        quantity: Math.max(1, parseInt(values[quantityIndex] || '1')),
        purchase_price: Math.max(0, parseFloat(values[purchasePriceIndex] || '0')),
        current_price: Math.max(0, parseFloat(values[currentPriceIndex] || values[purchasePriceIndex] || '0')),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }))
      .filter(stock => stock.symbol && stock.purchase_price > 0);
  };

  const importFromGoogleSheets = () => {
    toast.info('Google Sheets integration: Please export your sheet as Excel/CSV and upload here.');
    window.open('https://sheets.google.com', '_blank');
  };

  const downloadTemplate = () => {
    const csvContent = [
      'symbol,name,quantity,purchase_price,current_price',
      'RELIANCE,Reliance Industries Ltd.,10,2200.50,2456.75',
      'TCS,Tata Consultancy Services,5,3500.00,3678.90',
      'HDFCBANK,HDFC Bank Ltd.,8,1450.00,1567.45',
      'INFY,Infosys Ltd.,12,1500.00,1456.30'
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio-template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Template downloaded! Fill it with your data and upload.');
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
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        <GlassCard className="p-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-xl bg-blue-500/20">
                <Upload className="w-7 h-7 text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Import Portfolio</h2>
                <p className="text-gray-600 dark:text-gray-400">Upload your stock data from various sources</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
            >
              ✕
            </button>
          </div>

          {/* File Drop Zone */}
          <div
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all cursor-pointer ${
              dragActive
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 scale-105'
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50'
            }`}
          >
            <input
              type="file"
              onChange={handleFileInput}
              accept=".csv,.xlsx,.xls,.png,.jpg,.jpeg,.gif,.bmp"
              className="hidden"
              id="file-input"
              disabled={importing}
            />
            
            {importing ? (
              <div className="space-y-6">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <Loader className="w-16 h-16 text-blue-500 mx-auto" />
                </motion.div>
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-4 text-lg font-medium">
                    {processingType === 'image' ? 'Processing image with OCR...' :
                     processingType === 'excel' ? 'Reading Excel file...' :
                     'Processing CSV file...'}
                  </p>
                  {processingType === 'image' && (
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <motion.div 
                        className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${ocrProgress}%` }}
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      />
                    </div>
                  )}
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                    {ocrProgress > 0 ? `${ocrProgress}% complete` : 'Please wait...'}
                  </p>
                </div>
              </div>
            ) : (
              <>
                <Upload className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Drag and drop your file here
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  or click to browse and select a file
                </p>
                <GlassButton
                  onClick={() => document.getElementById('file-input')?.click()}
                  className="mx-auto"
                >
                  Choose File
                </GlassButton>
                <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">CSV</span>
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">Excel (.xlsx, .xls)</span>
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-full">Images (OCR)</span>
                </div>
              </>
            )}
          </div>

          {/* Import Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <GlassButton
                onClick={importFromGoogleSheets}
                disabled={importing}
                className="w-full flex flex-col items-center space-y-3 p-6 h-full bg-green-500/10 border-green-500/20 hover:bg-green-500/20"
              >
                <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                  <span className="text-green-400 text-2xl font-bold">G</span>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-green-400">Google Sheets</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Export as Excel/CSV first</div>
                </div>
              </GlassButton>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <GlassButton
                onClick={() => document.getElementById('file-input')?.click()}
                disabled={importing}
                className="w-full flex flex-col items-center space-y-3 p-6 h-full bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20"
              >
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                  <Table className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-blue-400">Excel File</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">.xlsx, .xls formats</div>
                </div>
              </GlassButton>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <GlassButton
                onClick={() => document.getElementById('file-input')?.click()}
                disabled={importing}
                className="w-full flex flex-col items-center space-y-3 p-6 h-full bg-purple-500/10 border-purple-500/20 hover:bg-purple-500/20"
              >
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                  <Image className="w-6 h-6 text-purple-400" />
                </div>
                <div className="text-center">
                  <div className="font-semibold text-purple-400">Image (OCR)</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">Extract text from images</div>
                </div>
              </GlassButton>
            </motion.div>
          </div>

          {/* Template Download */}
          <div className="mt-8 p-6 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-xl bg-orange-500/20">
                  <FileText className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">Need a template?</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Download our sample CSV file with Indian stock examples
                  </p>
                </div>
              </div>
              <GlassButton
                onClick={downloadTemplate}
                className="flex items-center space-x-2 bg-orange-500/10 border-orange-500/20 text-orange-600 dark:text-orange-400 hover:bg-orange-500/20"
              >
                <Download className="w-4 h-4" />
                <span>Download Template</span>
              </GlassButton>
            </div>
          </div>

          {/* Supported Formats */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <h4 className="font-semibold text-gray-900 dark:text-white mb-3">Supported File Formats & Requirements:</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div>
                <strong className="text-green-600 dark:text-green-400">CSV Files:</strong>
                <ul className="mt-1 space-y-1 ml-4">
                  <li>• Headers: symbol, name, quantity, purchase_price, current_price</li>
                  <li>• Comma-separated values</li>
                  <li>• UTF-8 encoding recommended</li>
                </ul>
              </div>
              <div>
                <strong className="text-blue-600 dark:text-blue-400">Excel Files:</strong>
                <ul className="mt-1 space-y-1 ml-4">
                  <li>• .xlsx and .xls formats supported</li>
                  <li>• First row should contain headers</li>
                  <li>• Data starts from second row</li>
                </ul>
              </div>
              <div>
                <strong className="text-purple-600 dark:text-purple-400">Image Files:</strong>
                <ul className="mt-1 space-y-1 ml-4">
                  <li>• .png, .jpg, .jpeg formats</li>
                  <li>• Clear, high-resolution text</li>
                  <li>• OCR extracts: SYMBOL QTY PRICE</li>
                </ul>
              </div>
              <div>
                <strong className="text-orange-600 dark:text-orange-400">Data Requirements:</strong>
                <ul className="mt-1 space-y-1 ml-4">
                  <li>• Stock symbol is mandatory</li>
                  <li>• Purchase price must be {'>'}  0</li>
                  <li>• Quantity defaults to 1 if missing</li>
                </ul>
              </div>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
};