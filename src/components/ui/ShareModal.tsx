import { useState } from 'react';
import { motion } from 'framer-motion';
import QRCode from 'qrcode';
import { 
  Share2, 
  Mail, 
  MessageCircle, 
  Send, 
  Instagram, 
  Copy, 
  Download,
  QrCode,
  Link
} from 'lucide-react';
import { 
  EmailShareButton,
  WhatsappShareButton,
  TelegramShareButton,
  TwitterShareButton
} from 'react-share';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';
import toast from 'react-hot-toast';

interface ShareModalProps {
  onClose: () => void;
  portfolioData: any;
}

export const ShareModal = ({ onClose, portfolioData }: ShareModalProps) => {
  const [shareUrl, setShareUrl] = useState('');
  const [isGeneratingLink, setIsGeneratingLink] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [showQR, setShowQR] = useState(false);

  const generateShareLink = async () => {
    setIsGeneratingLink(true);
    
    // Simulate API call to generate secure share link
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const uniqueId = Math.random().toString(36).substring(2, 15);
    const generatedUrl = `https://stockdashboard.app/shared/${uniqueId}`;
    setShareUrl(generatedUrl);
    setIsGeneratingLink(false);
    
    toast.success('Secure share link generated!');
  };

  const generateQRCode = async () => {
    if (!shareUrl) {
      await generateShareLink();
      return;
    }
    
    try {
      const qrDataUrl = await QRCode.toDataURL(shareUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeUrl(qrDataUrl);
      setShowQR(true);
    } catch (error) {
      toast.error('Failed to generate QR code');
    }
  };

  const downloadQR = () => {
    if (qrCodeUrl) {
      const link = document.createElement('a');
      link.download = 'portfolio-qr-code.png';
      link.href = qrCodeUrl;
      link.click();
      toast.success('QR code downloaded!');
    }
  };

  const copyToClipboard = async () => {
    if (shareUrl) {
      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard!');
    }
  };

  const shareTitle = `Check out my stock portfolio performance!`;
  const shareText = `My portfolio is up ${portfolioData?.totalGainLossPercent?.toFixed(2) || '0'}%! 📈`;

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
              <Share2 className="w-6 h-6 text-gray-900 dark:text-white" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Share Portfolio</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ✕
            </button>
          </div>

          {/* Generate Secure Link */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Generate Secure Link
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Create a private, time-limited link to share your portfolio safely.
            </p>
            
            {!shareUrl ? (
              <GlassButton
                onClick={generateShareLink}
                disabled={isGeneratingLink}
                className="w-full flex items-center justify-center space-x-2"
              >
                {isGeneratingLink ? (
                  <>
                    <motion.div
                      className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    />
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Link className="w-4 h-4" />
                    <span>Generate Secure Link</span>
                  </>
                )}
              </GlassButton>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center space-x-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <input
                    type="text"
                    value={shareUrl}
                    readOnly
                    className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white"
                  />
                  <button
                    onClick={copyToClipboard}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
                  >
                    <Copy className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  </button>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  🔒 This link expires in 24 hours and requires no login
                </div>
              </div>
            )}
          </div>

          {/* Social Sharing */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
              Share via Social Media
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <WhatsappShareButton
                url={shareUrl || 'https://stockdashboard.app'}
                title={shareText}
                className="w-full"
              >
                <GlassButton className="w-full flex items-center justify-center space-x-2 bg-green-500/20 text-green-600 dark:text-green-400">
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp</span>
                </GlassButton>
              </WhatsappShareButton>

              <TelegramShareButton
                url={shareUrl || 'https://stockdashboard.app'}
                title={shareText}
                className="w-full"
              >
                <GlassButton className="w-full flex items-center justify-center space-x-2 bg-blue-500/20 text-blue-600 dark:text-blue-400">
                  <Send className="w-4 h-4" />
                  <span>Telegram</span>
                </GlassButton>
              </TelegramShareButton>

              <EmailShareButton
                url={shareUrl || 'https://stockdashboard.app'}
                subject={shareTitle}
                body={shareText}
                className="w-full"
              >
                <GlassButton className="w-full flex items-center justify-center space-x-2 bg-red-500/20 text-red-600 dark:text-red-400">
                  <Mail className="w-4 h-4" />
                  <span>Email</span>
                </GlassButton>
              </EmailShareButton>

              <TwitterShareButton
                url={shareUrl || 'https://stockdashboard.app'}
                title={shareText}
                className="w-full"
              >
                <GlassButton className="w-full flex items-center justify-center space-x-2 bg-sky-500/20 text-sky-600 dark:text-sky-400">
                  <span className="w-4 h-4 font-bold">𝕏</span>
                  <span>Twitter</span>
                </GlassButton>
              </TwitterShareButton>
            </div>
          </div>

          {/* Additional Options */}
          <div className="space-y-3">
            <GlassButton
              className="w-full flex items-center justify-center space-x-2"
              onClick={generateQRCode}
            >
              <QrCode className="w-4 h-4" />
              <span>Generate QR Code</span>
            </GlassButton>
            
            <GlassButton
              className="w-full flex items-center justify-center space-x-2"
              onClick={() => toast.info('Instagram sharing coming soon!')}
            >
              <Instagram className="w-4 h-4" />
              <span>Share to Instagram Story</span>
            </GlassButton>
          </div>

          {/* QR Code Display */}
          {showQR && qrCodeUrl && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6 p-4 bg-white rounded-lg text-center"
            >
              <img src={qrCodeUrl} alt="QR Code" className="mx-auto mb-3" />
              <p className="text-sm text-gray-600 mb-3">
                Scan to view portfolio
              </p>
              <GlassButton
                size="sm"
                onClick={downloadQR}
                className="flex items-center space-x-1 mx-auto"
              >
                <Download className="w-4 h-4" />
                <span>Download QR</span>
              </GlassButton>
            </motion.div>
          )}

          <div className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center">
            Shared portfolios are read-only and don't include personal information
          </div>
        </GlassCard>
      </motion.div>
    </motion.div>
  );
};