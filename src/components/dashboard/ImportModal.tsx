import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Table, Download, Image, Eye, Loader } from 'lucide-react';
import { Stock } from '../../types';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import Tesseract from 'tesseract.js';
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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        handleFile(acceptedFiles[0]);
      }
    },
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.bmp']
    },
    multiple: false
  });

  const handleFile = async (file: File) => {
    setImporting(true);
    setOcrProgress(0);
    
    try {
      let stocks: Stock[] = [];
      const fileType = file.type;

      if (fileType === 'text/csv' || file.name.endsWith('.csv')) {
        setProcessingType('csv');
        const text = await file.text();
        stocks = parseCSV(text);
      } else if (fileType.includes('sheet') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        setProcessingType('excel');
        stocks = await parseExcel(file);
      } else if (fileType.startsWith('image/')) {
        setProcessingType('image');
        stocks = await parseImageWithOCR(file);
      } else {
        throw new Error('Unsupported file format');
      }

      onImport(stocks);
      onClose();
    } catch (error) {
      toast.error('Failed to import file. Please check the format.');
    } finally {
      setImporting(false);
      setProcessingType(null);
      setOcrProgress(0);
    }
  };

  const parseExcel = async (file: File): Promise<Stock[]> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
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
      reader.readAsArrayBuffer(file);
    });
  };

  const parseExcelData = (data: any[][]): Stock[] => {
    if (data.length < 2) return [];
    
    const headers = data[0].map((h: any) => h?.toString().toLowerCase().trim());
    const symbolIndex = headers.findIndex((h: string) => h.includes('symbol'));
    const nameIndex = headers.findIndex((h: string) => h.includes('name') || h.includes('company'));
    const quantityIndex = headers.findIndex((h: string) => h.includes('quantity') || h.includes('qty'));
    const purchasePriceIndex = headers.findIndex((h: string) => h.includes('purchase') || h.includes('buy'));
    const currentPriceIndex = headers.findIndex((h: string) => h.includes('current') || h.includes('price'));
    
    return data.slice(1).filter(row => row.length > 0).map((row, index) => ({
      id: Date.now().toString() + index,
      user_id: '1',
      symbol: row[symbolIndex]?.toString() || '',
      name: row[nameIndex]?.toString() || '',
      quantity: parseInt(row[quantityIndex]?.toString() || '0'),
      purchase_price: parseFloat(row[purchasePriceIndex]?.toString() || '0'),
      current_price: parseFloat(row[currentPriceIndex]?.toString() || '0'),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }));
  };

  const parseImageWithOCR = async (file: File): Promise<Stock[]> => {
    return new Promise((resolve, reject) => {
      Tesseract.recognize(file, 'eng', {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setOcrProgress(Math.round(m.progress * 100));
          }
        }
      }).then(({ data: { text } }) => {
        try {
          const stocks = parseOCRText(text);
          resolve(stocks);
        } catch (error) {
          reject(error);
        }
      }).catch(reject);
    });
  };

  const parseOCRText = (text: string): Stock[] => {
    const lines = text.split('\n').filter(line => line.trim());
    const stocks: Stock[] = [];
    
    // Simple pattern matching for stock data
    lines.forEach((line, index) => {
      const matches = line.match(/([A-Z]{2,10})\s+([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)/);
      if (matches) {
        stocks.push({
          id: Date.now().toString() + index,
          user_id: '1',
          symbol: matches[1],
          name: `${matches[1]} Company`,
          quantity: parseInt(matches[2]) || 1,
          purchase_price: parseFloat(matches[3]) || 0,
          current_price: parseFloat(matches[4]) || 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
    });
    
    return stocks;
  };

  const importFromGoogleSheets = () => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      toast.error('Google Sheets integration not configured');
      return;
    }
    
    // This would typically use Google Sheets API
    toast.info('Google Sheets integration coming soon!');
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
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              isDragActive
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
            }`}
          >
            <input {...getInputProps()} disabled={importing} />
            {importing ? (
              <div className="space-y-4">
                <Loader className="w-12 h-12 text-blue-500 mx-auto animate-spin" />
                <div>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">
                    {processingType === 'image' ? 'Processing image with OCR...' :
                     processingType === 'excel' ? 'Reading Excel file...' :
                     'Processing CSV file...'}
                  </p>
                  {processingType === 'image' && (
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${ocrProgress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <>
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  Drag and drop your file here, or click to browse
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Supports CSV, Excel (.xlsx, .xls), and Image files (with OCR)
                </p>
              </>
            )}
          </div>

          {/* Import Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <GlassButton
              onClick={importFromGoogleSheets}
              disabled={importing}
              className="flex items-center justify-center space-x-2 p-4"
            >
              <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold">G</span>
              </div>
              <span>Google Sheets</span>
            </GlassButton>
            
            <GlassButton
              onClick={() => document.querySelector('input[type="file"]')?.click()}
              disabled={importing}
              className="flex items-center justify-center space-x-2 p-4"
            >
              <Table className="w-5 h-5" />
              <span>Excel File</span>
            </GlassButton>
            
            <GlassButton
              onClick={() => document.querySelector('input[type="file"]')?.click()}
              disabled={importing}
              className="flex items-center justify-center space-x-2 p-4"
            >
              <Image className="w-5 h-5" />
              <span>Image (OCR)</span>
            </GlassButton>
          </div>

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
              <li>• Excel: .xlsx, .xls files with proper column headers</li>
              <li>• Images: .png, .jpg, .jpeg with OCR text recognition</li>
              <li>• Google Sheets: Direct import from Google Drive</li>
            </ul>
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
};