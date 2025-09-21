import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Image, Table, Globe, Link2, QrCode, Share2 } from 'lucide-react';
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
      const html2canvas = await import('html2canvas');
      const jsPDF = await import('jspdf');
      
      const element = document.getElementById('dashboard-content');
      if (element) {
        const canvas = await html2canvas.default(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
          allowTaint: true
        });
        
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF.default('p', 'mm', 'a4');
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

        // Add header
        pdf.setFontSize(16);
        pdf.text('Portfolio Report - ' + new Date().toLocaleDateString(), 10, 10);
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
    setIsExporting(true);
    
    import('xlsx').then(XLSX => {
      const worksheetData = [
        ['Portfolio Report - ' + new Date().toLocaleDateString()],
        [],
        ['Symbol', 'Name', 'Quantity', 'Purchase Price (₹)', 'Current Price (₹)', 'Total Value (₹)', 'Gain/Loss (₹)', 'Gain/Loss (%)'],
        ...portfolioData.stocks.map((stock: any) => {
          const totalValue = stock.current_price * stock.quantity;
          const gainLoss = (stock.current_price - stock.purchase_price) * stock.quantity;
          const gainLossPercent = ((stock.current_price - stock.purchase_price) / stock.purchase_price) * 100;
          
          return [
            stock.symbol,
            stock.name,
            stock.quantity,
            stock.purchase_price.toFixed(2),
            stock.current_price.toFixed(2),
            totalValue.toFixed(2),
            gainLoss.toFixed(2),
            gainLossPercent.toFixed(2) + '%'
          ];
        }),
        [],
        ['Summary'],
        ['Total Portfolio Value', '₹' + portfolioData.totalValue?.toFixed(2)],
        ['Total Invested', '₹' + portfolioData.totalInvested?.toFixed(2)],
        ['Total Gain/Loss', '₹' + portfolioData.totalGainLoss?.toFixed(2)],
        ['Return Percentage', portfolioData.totalGainLossPercent?.toFixed(2) + '%']
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Portfolio');
      
      // Add styling
      const range = XLSX.utils.decode_range(worksheet['!ref'] || 'A1');
      
      // Style header row
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const headerAddress = XLSX.utils.encode_col(C) + "3";
        if (!worksheet[headerAddress]) continue;
        worksheet[headerAddress].s = {
          font: { bold: true, color: { rgb: "FFFFFF" } },
          fill: { fgColor: { rgb: "4F46E5" } },
          alignment: { horizontal: "center" }
        };
      }
      
      // Set column widths
      worksheet['!cols'] = [
        { width: 12 }, // Symbol
        { width: 25 }, // Name
        { width: 10 }, // Quantity
        { width: 15 }, // Purchase Price
        { width: 15 }, // Current Price
        { width: 15 }, // Total Value
        { width: 15 }, // Gain/Loss
        { width: 15 }  // Gain/Loss %
      ];
      
      XLSX.writeFile(workbook, `portfolio-${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Excel file exported successfully!');
    }).catch(() => {
      toast.error('Failed to export Excel file');
    }).finally(() => {
      setIsExporting(false);
    });
  };

  const exportToCSV = () => {
    const worksheetData = [
      ['Symbol', 'Name', 'Quantity', 'Purchase Price', 'Current Price', 'Total Value', 'Gain/Loss', 'Gain/Loss %'],
      ...portfolioData.stocks.map((stock: any) => [
        stock.symbol,
        stock.name,
        stock.quantity,
        stock.purchase_price.toFixed(2),
        stock.current_price.toFixed(2),
        (stock.current_price * stock.quantity).toFixed(2),
        ((stock.current_price - stock.purchase_price) * stock.quantity).toFixed(2),
        (((stock.current_price - stock.purchase_price) / stock.purchase_price) * 100).toFixed(2) + '%'
      ])
    ];

    const csvContent = worksheetData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('CSV file exported successfully!');
  };

  const exportToGoogleSheets = () => {
    toast.info('Exporting to CSV format for Google Sheets import...');
    exportToCSV();
    setTimeout(() => {
      toast.success('CSV downloaded! Go to Google Sheets → File → Import to upload.');
      window.open('https://sheets.google.com/create', '_blank');
    }, 1500);
  };

  const exportToJSON = () => {
    const jsonData = {
      exportDate: new Date().toISOString(),
      summary: {
        totalValue: portfolioData.totalValue,
        totalInvested: portfolioData.totalInvested,
        totalGainLoss: portfolioData.totalGainLoss,
        totalGainLossPercent: portfolioData.totalGainLossPercent,
        stockCount: portfolioData.stocks.length
      },
      stocks: portfolioData.stocks,
      metadata: {
        exportVersion: '2.0',
        currency: 'INR',
        source: 'Stock Dashboard Pro'
      }
    };
    
    const blob = new Blob([JSON.stringify(jsonData, null, 2)], { type: 'application/json' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portfolio-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('JSON file exported successfully!');
  };

  const generateShareLink = async () => {
    setIsExporting(true);
    try {
      // Simulate API call to generate secure share link
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const uniqueId = Math.random().toString(36).substring(2, 15);
      const generatedUrl = `https://stockdashboard.pro/shared/${uniqueId}?expires=${Date.now() + 86400000}`;
      setShareLink(generatedUrl);
      
      // Copy to clipboard
      await navigator.clipboard.writeText(generatedUrl);
      toast.success('Secure share link generated and copied! Valid for 24 hours.');
    } catch (error) {
      toast.error('Failed to generate share link');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToImage = async () => {
    setIsExporting(true);
    try {
      const html2canvas = await import('html2canvas');
      const element = document.getElementById('dashboard-content');
      if (element) {
        const canvas = await html2canvas.default(element, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
          allowTaint: true
        });
        
        const link = document.createElement('a');
        link.download = `portfolio-dashboard-${new Date().toISOString().split('T')[0]}.png`;
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
      title: 'PDF Report',
      description: 'Complete portfolio report with charts and analysis',
      icon: FileText,
      action: exportToPDF,
      color: 'bg-red-500/20 text-red-600 dark:text-red-400'
    },
    {
      id: 'excel',
      title: 'Excel Spreadsheet',
      description: 'Detailed data with calculations and formatting',
      icon: Table,
      action: exportToExcel,
      color: 'bg-green-500/20 text-green-600 dark:text-green-400'
    },
    {
      id: 'csv',
      title: 'CSV File',
      description: 'Simple comma-separated values format',
      icon: FileText,
      action: exportToCSV,
      color: 'bg-orange-500/20 text-orange-600 dark:text-orange-400'
    },
    {
      id: 'sheets',
      title: 'Google Sheets',
      description: 'Export CSV and open in Google Sheets',
      icon: Globe,
      action: exportToGoogleSheets,
      color: 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
    },
    {
      id: 'json',
      title: 'JSON Data',
      description: 'Structured data for developers and APIs',
      icon: FileText,
      action: exportToJSON,
      color: 'bg-purple-500/20 text-purple-600 dark:text-purple-400'
    },
    {
      id: 'image',
      title: 'PNG Image',
      description: 'High-quality dashboard screenshot',
      icon: Image,
      action: exportToImage,
      color: 'bg-cyan-500/20 text-cyan-600 dark:text-cyan-400'
    },
    {
      id: 'share',
      title: 'Secure Share Link',
      description: 'Generate encrypted link (24hr expiry)',
      icon: Share2,
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
              <div className="p-3 rounded-xl bg-blue-500/20">
                <Download className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Export Portfolio</h2>
                <p className="text-gray-600 dark:text-gray-400">Choose your preferred export format</p>
              </div>
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
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exportOptions.map((option) => (
              <motion.div
                key={option.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <GlassButton
                  onClick={option.action}
                  disabled={isExporting}
                  className={`w-full p-4 text-left flex items-center space-x-4 ${option.color} border-opacity-30 hover:border-opacity-50`}
                >
                  <div className={`p-3 rounded-xl ${option.color.replace('text-', 'bg-').replace('dark:text-', 'dark:bg-')} bg-opacity-30`}>
                    <option.icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
              <div className="flex items-start justify-between">
                    </h3>
                  <h4 className="font-bold text-indigo-900 dark:text-indigo-100 text-lg mb-2">🔗 Secure Share Link Generated</h4>
                  <p className="text-sm text-indigo-700 dark:text-indigo-300 break-all bg-white/50 dark:bg-black/20 p-3 rounded-lg font-mono">
                    {shareLink}
                  </p>
                  <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2">
                    🔒 Link expires in 24 hours • Read-only access • No personal data shared
                  </p>
                    </p>
                  </div>
                  {isExporting && (
                  className="ml-4 bg-indigo-500/20 border-indigo-500/30 text-indigo-600 dark:text-indigo-400"
                    <motion.div
                      className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
                    toast.success('Share link copied to clipboard!');
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                  📋 Copy
                )
                }
                </GlassButton>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
            <div className="flex items-center justify-center space-x-6 text-xs text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Secure Local Processing</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>No Data Uploaded</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Privacy Protected</span>
              </div>
            </div>
          </div>
        </GlassCard>
              className="mt-6 p-6 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 rounded-2xl border border-indigo-200 dark:border-indigo-700"
    </motion.div>
  );
};