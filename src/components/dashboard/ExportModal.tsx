import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Image, Table, Globe, Sheet as Sheets, Link2, QrCode } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import toast from 'react-hot-toast';

interface ExportModalProps {
  onClose: () => void;
  portfolioData: any;
}

export const ExportModal = ({ onClose, portfolioData }: ExportModalProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const [shareLink, setShareLink] = useState('');

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const element = document.getElementById('dashboard-content');
      if (element) {
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff'
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        pdf.save('portfolio-report.pdf');
        toast.success('PDF exported successfully!');
      }
    } catch (error) {
      toast.error('Failed to export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToExcel = () => {
    const worksheetData = [
      ['Symbol', 'Name', 'Quantity', 'Purchase Price', 'Current Price', 'Total Value', 'Gain/Loss'],
      ...portfolioData.stocks.map((stock: any) => [
        stock.symbol,
        stock.name,
        stock.quantity,
        stock.purchase_price,
        stock.current_price,
        (stock.current_price * stock.quantity).toFixed(2),
        ((stock.current_price - stock.purchase_price) * stock.quantity).toFixed(2)
      ])
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Portfolio');
    
    // Add styling
    const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const address = XLSX.utils.encode_col(C) + "1";
      if (!worksheet[address]) continue;
      worksheet[address].s = {
        font: { bold: true },
        fill: { fgColor: { rgb: "FFFFAA00" } }
      };
    }
    
    XLSX.writeFile(workbook, 'portfolio-data.xlsx');
    toast.success('Excel file exported successfully!');
  };

  const exportToGoogleSheets = () => {
    // First export to Excel format, then provide instructions
    exportToExcel();
    setTimeout(() => {
      toast.success('Excel file downloaded! You can now upload it to Google Sheets.');
      window.open('https://sheets.google.com', '_blank');
    }, 1000);
  };

  const exportToJSON = () => {
    const jsonData = {
      exportDate: new Date().toISOString(),
      portfolio: portfolioData,
      metadata: {
        totalStocks: portfolioData.stocks.length,
        exportVersion: '1.0'
      }
    };
    
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio-data.json';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('JSON file exported successfully!');
  };

  const generateShareLink = async () => {
    setIsExporting(true);
    try {
      // Simulate API call to generate secure share link
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const uniqueId = Math.random().toString(36).substring(2, 15);
      const generatedUrl = `https://stockdashboard.app/shared/${uniqueId}`;
      setShareLink(generatedUrl);
      
      // Copy to clipboard
      await navigator.clipboard.writeText(generatedUrl);
      toast.success('Share link generated and copied to clipboard!');
    } catch (error) {
      toast.error('Failed to generate share link');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToImage = async () => {
    setIsExporting(true);
    try {
      const element = document.getElementById('dashboard-content');
      if (element) {
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff'
        });
        
        const link = document.createElement('a');
        link.download = 'portfolio-dashboard.png';
        link.href = canvas.toDataURL();
        link.click();
        toast.success('Image exported successfully!');
      }
    } catch (error) {
      toast.error('Failed to export image');
    } finally {
      setIsExporting(false);
    }
  };

  const exportOptions = [
    {
      id: 'pdf',
      title: 'Export as PDF',
      description: 'Complete portfolio report with charts',
      icon: FileText,
      action: exportToPDF,
      color: 'bg-red-500/20 text-red-600 dark:text-red-400'
    },
    {
      id: 'excel',
      title: 'Export to Excel',
      description: 'Stock data in CSV format',
      icon: Table,
      action: exportToExcel,
      color: 'bg-green-500/20 text-green-600 dark:text-green-400'
    },
    {
      id: 'sheets',
      title: 'Export to Google Sheets',
      description: 'Open directly in Google Sheets',
      icon: Sheets,
      action: exportToGoogleSheets,
      color: 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
    },
    {
      id: 'json',
      title: 'Export as JSON',
      description: 'Raw data in JSON format',
      icon: Globe,
      action: exportToJSON,
      color: 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
    },
    {
      id: 'image',
      title: 'Export as Image',
      description: 'Dashboard screenshot in PNG format',
      icon: Image,
      action: exportToImage,
      color: 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
    },
    {
      id: 'share',
      title: 'Generate Share Link',
      description: 'Create a secure link to share your portfolio',
      icon: Link2,
      action: generateShareLink,
      color: 'bg-indigo-500/20 text-indigo-600 dark:text-indigo-400'
    }
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
              <Download className="w-6 h-6 text-gray-900 dark:text-white" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Export Portfolio</h2>
            </div>
            <button
          
          {shareLink && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-indigo-900 dark:text-indigo-100">Share Link Generated</h4>
                  <p className="text-sm text-indigo-700 dark:text-indigo-300 break-all">{shareLink}</p>
                </div>
                <GlassButton
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(shareLink);
                    toast.success('Link copied!');
                  }}
                >
                  Copy
                </GlassButton>
              </div>
            </motion.div>
          )}
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          <div className="space-y-4">
            {exportOptions.map((option) => (
              <motion.div
                key={option.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <GlassButton
                  onClick={option.action}
                  disabled={isExporting}
                  className="w-full p-4 text-left flex items-center space-x-4"
                >
                  <div className={`p-3 rounded-lg ${option.color}`}>
                    <option.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {option.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {option.description}
                    </p>
                  </div>
                  {isExporting && (
                    <motion.div
                      className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                  )}
                </GlassButton>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 text-xs text-gray-500 dark:text-gray-400 text-center">
            All exports are generated locally and secure
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
};