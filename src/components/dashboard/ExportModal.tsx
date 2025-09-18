import { useState } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Image, Table } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import toast from 'react-hot-toast';

interface ExportModalProps {
  onClose: () => void;
  portfolioData: any;
}

export const ExportModal = ({ onClose, portfolioData }: ExportModalProps) => {
  const [isExporting, setIsExporting] = useState(false);

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
    const csvContent = [
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
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio-data.csv';
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Excel file exported successfully!');
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
      id: 'image',
      title: 'Export as Image',
      description: 'Dashboard screenshot in PNG format',
      icon: Image,
      action: exportToImage,
      color: 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
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